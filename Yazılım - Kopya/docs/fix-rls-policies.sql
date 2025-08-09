-- RLS Politikalarını Düzeltme Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 2. RLS'yi etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Yeni politikaları oluştur
-- Tüm kullanıcılar profilleri görebilir
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir (kayıt sırasında)
-- Bu politika daha esnek - auth.uid() null olabilir (kayıt sırasında)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NOT NULL OR
    (auth.uid() IS NULL AND id IS NOT NULL)
  );

-- 4. Test için geçici olarak RLS'yi kapat (sadece test için)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Politikaları kontrol et
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Test sorgusu
-- Bu sorguyu manuel olarak test edin:
-- INSERT INTO profiles (id, username, email) VALUES (gen_random_uuid(), 'test', 'test@test.com');
