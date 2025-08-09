-- Admin Sistemi için Veritabanı Yapıları

-- 1. User roles tablosu
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- 2. Admin actions log tablosu
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. System settings tablosu
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User reports tablosu
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  reported_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Moderation actions tablosu
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  reason TEXT,
  duration_hours INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_is_active ON moderation_actions(is_active);

-- RLS Politikaları
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- User roles politikaları
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

-- Admin actions politikaları
CREATE POLICY "Admins can view admin actions" ON admin_actions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

CREATE POLICY "Admins can create admin actions" ON admin_actions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

-- System settings politikaları
CREATE POLICY "Public settings are viewable by everyone" ON system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON system_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

-- User reports politikaları
CREATE POLICY "Users can create reports" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON user_reports
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

CREATE POLICY "Admins can manage reports" ON user_reports
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

-- Moderation actions politikaları
CREATE POLICY "Admins can manage moderation actions" ON moderation_actions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  ));

-- Fonksiyonlar
-- Kullanıcının admin olup olmadığını kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'admin' 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının moderator olup olmadığını kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION is_moderator(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('admin', 'moderator')
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin action log fonksiyonu
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type VARCHAR(100),
  target_type VARCHAR(50) DEFAULT NULL,
  target_id UUID DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
  VALUES (auth.uid(), action_type, target_type, target_id, details)
  RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Varsayılan sistem ayarları
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('site_name', 'Forum Uygulaması', 'string', 'Site adı', true),
  ('site_description', 'Modern forum uygulaması', 'string', 'Site açıklaması', true),
  ('max_topics_per_day', '10', 'integer', 'Günlük maksimum başlık sayısı', true),
  ('max_comments_per_day', '50', 'integer', 'Günlük maksimum yorum sayısı', true),
  ('auto_approve_topics', 'true', 'boolean', 'Başlıkları otomatik onayla', false),
  ('auto_approve_comments', 'true', 'boolean', 'Yorumları otomatik onayla', false),
  ('maintenance_mode', 'false', 'boolean', 'Bakım modu', true),
  ('registration_enabled', 'true', 'boolean', 'Kayıt olmaya izin ver', true),
  ('guest_viewing_enabled', 'true', 'boolean', 'Misafir görüntülemeye izin ver', true);

-- İlk admin kullanıcısını oluşturmak için fonksiyon
CREATE OR REPLACE FUNCTION create_first_admin(admin_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Email'e göre kullanıcıyı bul
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admin rolü ver
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES (admin_user_id, 'admin', admin_user_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Admin action log
  PERFORM log_admin_action('first_admin_created', 'user', admin_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View'lar
-- Admin dashboard için istatistikler
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM topics) as total_topics,
  (SELECT COUNT(*) FROM comments) as total_comments,
  (SELECT COUNT(*) FROM user_reports WHERE status = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM topics WHERE created_at >= NOW() - INTERVAL '24 hours') as topics_today,
  (SELECT COUNT(*) FROM comments WHERE created_at >= NOW() - INTERVAL '24 hours') as comments_today,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '24 hours') as new_users_today;

-- Son admin aktiviteleri
CREATE OR REPLACE VIEW recent_admin_actions AS
SELECT 
  aa.id,
  aa.action_type,
  aa.target_type,
  aa.target_id,
  aa.details,
  aa.created_at,
  p.username as admin_username,
  p.avatar_url as admin_avatar
FROM admin_actions aa
JOIN profiles p ON aa.admin_id = p.id
ORDER BY aa.created_at DESC
LIMIT 50;

-- Bekleyen raporlar
CREATE OR REPLACE VIEW pending_reports AS
SELECT 
  ur.id,
  ur.report_type,
  ur.reason,
  ur.status,
  ur.created_at,
  reporter.username as reporter_username,
  reported.username as reported_username,
  t.title as topic_title,
  c.content as comment_content
FROM user_reports ur
JOIN profiles reporter ON ur.reporter_id = reporter.id
LEFT JOIN profiles reported ON ur.reported_user_id = reported.id
LEFT JOIN topics t ON ur.reported_topic_id = t.id
LEFT JOIN comments c ON ur.reported_comment_id = c.id
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC; 