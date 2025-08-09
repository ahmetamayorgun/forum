-- Puan sistemi için veritabanı yapısı
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Kullanıcı puanları tablosu
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0,
  total_topics INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Puan geçmişi tablosu
CREATE TABLE IF NOT EXISTS points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points_earned INTEGER NOT NULL,
  points_type TEXT NOT NULL, -- 'topic_created', 'comment_created', 'like_received'
  source_id UUID, -- topic_id veya comment_id
  source_type TEXT, -- 'topic' veya 'comment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS politikaları
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- User points politikaları
CREATE POLICY "Users can view all user points" ON user_points
  FOR SELECT USING (true);

CREATE POLICY "Users can update own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert user points" ON user_points
  FOR INSERT WITH CHECK (true);

-- Points history politikaları
CREATE POLICY "Users can view all points history" ON points_history
  FOR SELECT USING (true);

CREATE POLICY "System can insert points history" ON points_history
  FOR INSERT WITH CHECK (true);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at);

-- Puan hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_user_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  topic_points INTEGER;
  comment_points INTEGER;
  total_like_points INTEGER;
BEGIN
  -- Başlık puanları (her başlık 100 puan)
  SELECT COALESCE(COUNT(*) * 100, 0) INTO topic_points
  FROM topics
  WHERE user_id = user_uuid;

  -- Yorum puanları (her yorum 30 puan)
  SELECT COALESCE(COUNT(*) * 30, 0) INTO comment_points
  FROM comments
  WHERE user_id = user_uuid;

  -- Beğeni puanları (her beğeni 10 puan)
  SELECT COALESCE(SUM(like_points), 0) INTO total_like_points
  FROM (
    -- Başlık beğenileri
    SELECT COUNT(*) * 10 as like_points
    FROM topic_likes tl
    JOIN topics t ON tl.topic_id = t.id
    WHERE t.user_id = user_uuid AND tl.like_type = 'like'
    UNION ALL
    -- Yorum beğenileri
    SELECT COUNT(*) * 10 as like_points
    FROM comment_likes cl
    JOIN comments c ON cl.comment_id = c.id
    WHERE c.user_id = user_uuid AND cl.like_type = 'like'
  ) likes;

  RETURN topic_points + comment_points + total_like_points;
END;
$$ LANGUAGE plpgsql;

-- Puan güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_user_points(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_points INTEGER;
  total_topics_count INTEGER;
  total_comments_count INTEGER;
  total_likes_count INTEGER;
BEGIN
  -- Toplam puanları hesapla
  total_points := calculate_user_points(user_uuid);
  
  -- İstatistikleri hesapla
  SELECT COALESCE(COUNT(*), 0) INTO total_topics_count
  FROM topics WHERE user_id = user_uuid;
  
  SELECT COALESCE(COUNT(*), 0) INTO total_comments_count
  FROM comments WHERE user_id = user_uuid;
  
  SELECT COALESCE(SUM(like_count), 0) INTO total_likes_count
  FROM (
    SELECT COUNT(*) as like_count
    FROM topic_likes tl
    JOIN topics t ON tl.topic_id = t.id
    WHERE t.user_id = user_uuid AND tl.like_type = 'like'
    UNION ALL
    SELECT COUNT(*) as like_count
    FROM comment_likes cl
    JOIN comments c ON cl.comment_id = c.id
    WHERE c.user_id = user_uuid AND cl.like_type = 'like'
  ) all_likes;

  -- Puanları güncelle veya oluştur
  INSERT INTO user_points (user_id, points, total_topics, total_comments, total_likes_received)
  VALUES (user_uuid, total_points, total_topics_count, total_comments_count, total_likes_count)
  ON CONFLICT (user_id) DO UPDATE SET
    points = EXCLUDED.points,
    total_topics = EXCLUDED.total_topics,
    total_comments = EXCLUDED.total_comments,
    total_likes_received = EXCLUDED.total_likes_received,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Başlık oluşturulduğunda puan ekleme trigger'ı
CREATE OR REPLACE FUNCTION add_topic_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Puan geçmişine ekle
  INSERT INTO points_history (user_id, points_earned, points_type, source_id, source_type)
  VALUES (NEW.user_id, 100, 'topic_created', NEW.id, 'topic');
  
  -- Kullanıcı puanlarını güncelle
  PERFORM update_user_points(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topic_points_trigger
  AFTER INSERT ON topics
  FOR EACH ROW
  EXECUTE FUNCTION add_topic_points();

-- Yorum oluşturulduğunda puan ekleme trigger'ı
CREATE OR REPLACE FUNCTION add_comment_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Puan geçmişine ekle
  INSERT INTO points_history (user_id, points_earned, points_type, source_id, source_type)
  VALUES (NEW.user_id, 30, 'comment_created', NEW.id, 'comment');
  
  -- Kullanıcı puanlarını güncelle
  PERFORM update_user_points(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_points_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION add_comment_points();

-- Beğeni alındığında puan ekleme trigger'ı
CREATE OR REPLACE FUNCTION add_like_points()
RETURNS TRIGGER AS $$
DECLARE
  topic_owner_id UUID;
  comment_owner_id UUID;
BEGIN
  -- Başlık beğenisi ise
  IF TG_TABLE_NAME = 'topic_likes' THEN
    SELECT user_id INTO topic_owner_id
    FROM topics
    WHERE id = NEW.topic_id;
    
    IF topic_owner_id IS NOT NULL AND NEW.like_type = 'like' THEN
      -- Puan geçmişine ekle
      INSERT INTO points_history (user_id, points_earned, points_type, source_id, source_type)
      VALUES (topic_owner_id, 10, 'like_received', NEW.topic_id, 'topic');
      
      -- Kullanıcı puanlarını güncelle
      PERFORM update_user_points(topic_owner_id);
    END IF;
  END IF;
  
  -- Yorum beğenisi ise
  IF TG_TABLE_NAME = 'comment_likes' THEN
    SELECT user_id INTO comment_owner_id
    FROM comments
    WHERE id = NEW.comment_id;
    
    IF comment_owner_id IS NOT NULL AND NEW.like_type = 'like' THEN
      -- Puan geçmişine ekle
      INSERT INTO points_history (user_id, points_earned, points_type, source_id, source_type)
      VALUES (comment_owner_id, 10, 'like_received', NEW.comment_id, 'comment');
      
      -- Kullanıcı puanlarını güncelle
      PERFORM update_user_points(comment_owner_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topic_like_points_trigger
  AFTER INSERT ON topic_likes
  FOR EACH ROW
  EXECUTE FUNCTION add_like_points();

CREATE TRIGGER comment_like_points_trigger
  AFTER INSERT ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION add_like_points();

-- Mevcut kullanıcılar için puan hesaplama
INSERT INTO user_points (user_id, points, total_topics, total_comments, total_likes_received)
SELECT 
  p.id,
  calculate_user_points(p.id),
  COALESCE(topic_count.count, 0),
  COALESCE(comment_count.count, 0),
  COALESCE(like_count.count, 0)
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM topics
  GROUP BY user_id
) topic_count ON p.id = topic_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM comments
  GROUP BY user_id
) comment_count ON p.id = comment_count.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as count
  FROM (
    SELECT t.user_id
    FROM topic_likes tl
    JOIN topics t ON tl.topic_id = t.id
    WHERE tl.like_type = 'like'
    UNION ALL
    SELECT c.user_id
    FROM comment_likes cl
    JOIN comments c ON cl.comment_id = c.id
    WHERE cl.like_type = 'like'
  ) likes
  GROUP BY user_id
) like_count ON p.id = like_count.user_id
ON CONFLICT (user_id) DO NOTHING; 

-- Üye seviyeleri için fonksiyon
CREATE OR REPLACE FUNCTION get_member_level(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF points >= 4000 THEN
    RETURN 'zümrüt';
  ELSIF points >= 3000 THEN
    RETURN 'elmas';
  ELSIF points >= 2000 THEN
    RETURN 'altın';
  ELSIF points >= 1000 THEN
    RETURN 'gümüş';
  ELSE
    RETURN 'bronz';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Üye seviyesi emojisi için fonksiyon
CREATE OR REPLACE FUNCTION get_member_emoji(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF points >= 4000 THEN
    RETURN '💎'; -- Zümrüt
  ELSIF points >= 3000 THEN
    RETURN '💠'; -- Elmas
  ELSIF points >= 2000 THEN
    RETURN '🥇'; -- Altın
  ELSIF points >= 1000 THEN
    RETURN '🥈'; -- Gümüş
  ELSE
    RETURN '🥉'; -- Bronz
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Kullanıcı bilgilerini üye seviyesi ile birlikte getiren view
CREATE OR REPLACE VIEW user_profiles_with_level AS
SELECT 
  p.*,
  up.points,
  up.total_topics,
  up.total_comments,
  up.total_likes_received,
  get_member_level(up.points) as member_level,
  get_member_emoji(up.points) as member_emoji
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id;

-- Üye seviyesi değişikliklerini takip eden tablo
CREATE TABLE IF NOT EXISTS member_level_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  old_level TEXT,
  new_level TEXT,
  points_at_change INTEGER NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS politikası
ALTER TABLE member_level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all member level history" ON member_level_history
  FOR SELECT USING (true);

CREATE POLICY "System can insert member level history" ON member_level_history
  FOR INSERT WITH CHECK (true);

-- Üye seviyesi değişikliklerini takip eden trigger
CREATE OR REPLACE FUNCTION track_member_level_change()
RETURNS TRIGGER AS $$
DECLARE
  old_level TEXT;
  new_level TEXT;
BEGIN
  -- Eski seviyeyi al
  IF TG_OP = 'UPDATE' THEN
    old_level := get_member_level(OLD.points);
  ELSE
    old_level := 'bronz';
  END IF;
  
  -- Yeni seviyeyi al
  new_level := get_member_level(NEW.points);
  
  -- Seviye değişmişse kaydet
  IF old_level != new_level THEN
    INSERT INTO member_level_history (user_id, old_level, new_level, points_at_change)
    VALUES (NEW.user_id, old_level, new_level, NEW.points);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_level_change_trigger
  AFTER INSERT OR UPDATE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION track_member_level_change();

-- Mevcut kullanıcılar için üye seviyesi geçmişini oluştur
INSERT INTO member_level_history (user_id, old_level, new_level, points_at_change)
SELECT 
  up.user_id,
  'bronz' as old_level,
  get_member_level(up.points) as new_level,
  up.points
FROM user_points up
WHERE up.points > 0;

-- Puan sistemi istatistikleri için view
CREATE OR REPLACE VIEW points_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN points >= 1000 THEN 1 END) as silver_users,
  COUNT(CASE WHEN points >= 2000 THEN 1 END) as gold_users,
  COUNT(CASE WHEN points >= 3000 THEN 1 END) as diamond_users,
  COUNT(CASE WHEN points >= 4000 THEN 1 END) as emerald_users,
  AVG(points) as average_points,
  MAX(points) as max_points
FROM user_points;

-- En yüksek puanlı kullanıcılar için view
CREATE OR REPLACE VIEW top_users AS
SELECT 
  p.username,
  p.email,
  up.points,
  up.total_topics,
  up.total_comments,
  up.total_likes_received,
  get_member_level(up.points) as member_level,
  get_member_emoji(up.points) as member_emoji
FROM user_points up
JOIN profiles p ON up.user_id = p.id
ORDER BY up.points DESC
LIMIT 50; 