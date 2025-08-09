-- Categories table for forum structure
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📁',
  color VARCHAR(7) DEFAULT '#3B82F6',
  slug VARCHAR(50) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  topic_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories with better structure
INSERT INTO categories (name, description, icon, color, slug, sort_order) VALUES
  ('💻 Teknoloji', 'Bilgisayar, telefon, tablet ve diğer teknolojik ürünler hakkında tartışmalar', '💻', '#3B82F6', 'teknoloji', 1),
  ('🎮 Oyun', 'Video oyunları, konsol oyunları ve oyun dünyasından haberler', '🎮', '#8B5CF6', 'oyun', 2),
  ('📱 Mobil', 'Akıllı telefonlar, tabletler ve mobil uygulamalar', '📱', '#10B981', 'mobil', 3),
  ('💡 Yazılım', 'Programlama, yazılım geliştirme ve teknoloji haberleri', '💡', '#F59E0B', 'yazilim', 4),
  ('🛒 Alışveriş', 'İndirimler, fırsatlar ve alışveriş tavsiyeleri', '🛒', '#EF4444', 'alisveris', 5),
  ('🎬 Eğlence', 'Film, müzik, spor ve eğlence dünyası', '🎬', '#EC4899', 'eglence', 6),
  ('🏠 Yaşam', 'Günlük yaşam, sağlık ve kişisel gelişim', '🏠', '#06B6D4', 'yasam', 7),
  ('📚 Eğitim', 'Eğitim, öğrenme ve kişisel gelişim konuları', '📚', '#84CC16', 'egitim', 8),
  ('💼 İş Dünyası', 'Kariyer, iş hayatı ve profesyonel gelişim', '💼', '#6366F1', 'is-dunyasi', 9),
  ('🌍 Dünya', 'Güncel olaylar, haberler ve dünya meseleleri', '🌍', '#F97316', 'dunya', 10),
  ('🚗 Otomotiv', 'Araçlar, modifiye ve otomotiv dünyası', '🚗', '#DC2626', 'otomotiv', 11),
  ('🏠 Emlak', 'Emlak, konut ve gayrimenkul konuları', '🏠', '#059669', 'emlak', 12),
  ('💰 Finans', 'Ekonomi, yatırım ve finansal konular', '💰', '#16A34A', 'finans', 13),
  ('🏥 Sağlık', 'Sağlık, spor ve fitness konuları', '🏥', '#DC2626', 'saglik', 14),
  ('🍔 Yemek', 'Yemek tarifleri, restoranlar ve gastronomi', '🍔', '#EA580C', 'yemek', 15);

-- Add category_id to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Update existing topics to have a default category
UPDATE topics SET category_id = (SELECT id FROM categories WHERE slug = 'teknoloji' LIMIT 1) WHERE category_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON topics(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all users to read categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Only admins can modify categories
CREATE POLICY "Categories are modifiable by admins" ON categories
  FOR ALL USING (auth.role() = 'admin');

-- Function to update topic count for categories
CREATE OR REPLACE FUNCTION update_category_topic_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update topic count for the category
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET topic_count = topic_count + 1,
        updated_at = NOW()
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET topic_count = topic_count - 1,
        updated_at = NOW()
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrease count for old category
    IF OLD.category_id IS NOT NULL THEN
      UPDATE categories 
      SET topic_count = topic_count - 1,
          updated_at = NOW()
      WHERE id = OLD.category_id;
    END IF;
    -- Increase count for new category
    IF NEW.category_id IS NOT NULL THEN
      UPDATE categories 
      SET topic_count = topic_count + 1,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update category topic counts
CREATE TRIGGER update_category_topic_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_category_topic_count();

-- View for categories with topic counts
CREATE OR REPLACE VIEW categories_with_stats AS
SELECT 
  c.*,
  COALESCE(topic_stats.topic_count, 0) as actual_topic_count,
  COALESCE(comment_stats.comment_count, 0) as comment_count,
  COALESCE(like_stats.like_count, 0) as like_count
FROM categories c
LEFT JOIN (
  SELECT category_id, COUNT(*) as topic_count
  FROM topics
  GROUP BY category_id
) topic_stats ON c.id = topic_stats.category_id
LEFT JOIN (
  SELECT t.category_id, COUNT(c.id) as comment_count
  FROM topics t
  LEFT JOIN comments c ON t.id = c.topic_id
  GROUP BY t.category_id
) comment_stats ON c.id = comment_stats.category_id
LEFT JOIN (
  SELECT t.category_id, COUNT(tl.id) as like_count
  FROM topics t
  LEFT JOIN topic_likes tl ON t.id = tl.topic_id
  WHERE tl.like_type = 'like'
  GROUP BY t.category_id
) like_stats ON c.id = like_stats.category_id
WHERE c.is_active = true
ORDER BY c.sort_order, c.name;

-- Function to get category tree (for nested categories)
CREATE OR REPLACE FUNCTION get_category_tree()
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(7),
  slug VARCHAR(50),
  parent_id UUID,
  sort_order INTEGER,
  topic_count INTEGER,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT 
      c.id,
      c.name,
      c.description,
      c.icon,
      c.color,
      c.slug,
      c.parent_id,
      c.sort_order,
      c.topic_count,
      0 as level
    FROM categories c
    WHERE c.parent_id IS NULL AND c.is_active = true
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
      child.id,
      child.name,
      child.description,
      child.icon,
      child.color,
      child.slug,
      child.parent_id,
      child.sort_order,
      child.topic_count,
      parent.level + 1
    FROM categories child
    JOIN category_tree parent ON child.parent_id = parent.id
    WHERE child.is_active = true
  )
  SELECT * FROM category_tree
  ORDER BY level, sort_order, name;
END;
$$ LANGUAGE plpgsql;

-- Update existing topic counts
UPDATE categories c
SET topic_count = (
  SELECT COUNT(*) 
  FROM topics t 
  WHERE t.category_id = c.id
); 