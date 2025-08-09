-- Kullanıcı Kayıt Sorununu Düzeltme SQL Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Önce mevcut profiles tablosunu kontrol edelim
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. RLS politikalarını kontrol edelim
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Eğer profiles tablosu yoksa oluşturalım
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. RLS'yi etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Eski politikaları temizle (eğer varsa)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 6. Yeni politikaları oluştur
-- Tüm kullanıcılar profilleri görebilir
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir (kayıt sırasında)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Trigger fonksiyonu oluştur (otomatik profil oluşturma için)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger'ı oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Mevcut kullanıcılar için eksik profilleri oluştur
INSERT INTO profiles (id, username, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)),
  au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 10. Test için örnek kullanıcı oluştur (opsiyonel)
-- Bu kısmı sadece test için kullanın
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- );

-- 11. Sonuçları kontrol et
SELECT 
  'Profiles count' as check_type,
  COUNT(*) as result
FROM profiles
UNION ALL
SELECT 
  'Auth users count' as check_type,
  COUNT(*) as result
FROM auth.users
UNION ALL
SELECT 
  'Users without profiles' as check_type,
  COUNT(*) as result
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 12. RLS politikalarını test et
-- Bu sorguları manuel olarak test edin:
-- SELECT * FROM profiles LIMIT 5;
-- INSERT INTO profiles (id, username, email) VALUES (gen_random_uuid(), 'test', 'test@test.com');
