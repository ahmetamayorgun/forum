-- Beğeni sistemi için veritabanı tabloları
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Beğeni türleri için enum
CREATE TYPE like_type AS ENUM ('like', 'dislike');

-- Başlık beğenileri tablosu
CREATE TABLE IF NOT EXISTS topic_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  like_type like_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Yorum beğenileri tablosu
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  like_type like_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- RLS politikaları
ALTER TABLE topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Topic likes politikaları
CREATE POLICY "Users can view all topic likes" ON topic_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage topic likes" ON topic_likes
  FOR ALL USING (auth.uid() = user_id);

-- Comment likes politikaları
CREATE POLICY "Users can view all comment likes" ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage comment likes" ON comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_topic_likes_topic_id ON topic_likes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_likes_user_id ON topic_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_likes_type ON topic_likes(like_type);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_type ON comment_likes(like_type);

-- Beğeni sayılarını hesaplamak için fonksiyonlar
CREATE OR REPLACE FUNCTION get_topic_like_count(topic_uuid UUID)
RETURNS TABLE(likes_count BIGINT, dislikes_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN like_type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
    COALESCE(SUM(CASE WHEN like_type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes_count
  FROM topic_likes 
  WHERE topic_id = topic_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_comment_like_count(comment_uuid UUID)
RETURNS TABLE(likes_count BIGINT, dislikes_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN like_type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
    COALESCE(SUM(CASE WHEN like_type = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes_count
  FROM comment_likes 
  WHERE comment_id = comment_uuid;
END;
$$ LANGUAGE plpgsql; 