-- User Points System
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Insert default points for existing users
INSERT INTO user_points (user_id, points)
SELECT id, 0 FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- RLS policies for user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Users can view all points
CREATE POLICY "Users can view all points" ON user_points
  FOR SELECT USING (true);

-- Users can update their own points
CREATE POLICY "Users can update own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert points for new users
CREATE POLICY "System can insert points" ON user_points
  FOR INSERT WITH CHECK (true);

-- Add likes_count and dislikes_count to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0;

-- Add likes_count and dislikes_count to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0; 