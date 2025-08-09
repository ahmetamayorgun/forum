-- Profiller tablosunu güncelleme
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Mevcut profiles tablosuna yeni sütunlar ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS marketplace_badges JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Pazaryeri rozetleri için enum tipi oluştur
CREATE TYPE marketplace_type AS ENUM (
  'amazon', 'hepsiburada', 'n11', 'trendyol', 'gitti_gidiyor', 
  'sahibinden', 'letgo', 'dolap', 'vakko', 'beymen', 'defacto'
);

-- Pazaryeri rozetleri tablosu
CREATE TABLE IF NOT EXISTS user_marketplace_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace marketplace_type NOT NULL,
  badge_type TEXT NOT NULL, -- 'verified', 'top_seller', 'premium' vb.
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, marketplace, badge_type)
);

-- RLS politikaları
ALTER TABLE user_marketplace_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all marketplace badges" ON user_marketplace_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own marketplace badges" ON user_marketplace_badges
  FOR ALL USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_marketplace_badges_user_id ON user_marketplace_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_marketplace_badges_marketplace ON user_marketplace_badges(marketplace);

-- Örnek rozet verileri ekle (test için)
INSERT INTO user_marketplace_badges (user_id, marketplace, badge_type) 
SELECT 
  p.id,
  'amazon'::marketplace_type,
  'verified_seller'
FROM profiles p 
WHERE p.username = 'TestUser'
UNION ALL
SELECT 
  p.id,
  'hepsiburada'::marketplace_type,
  'top_seller'
FROM profiles p 
WHERE p.username = 'TestUser'
UNION ALL
SELECT 
  p.id,
  'n11'::marketplace_type,
  'premium_seller'
FROM profiles p 
WHERE p.username = 'TestUser'; 