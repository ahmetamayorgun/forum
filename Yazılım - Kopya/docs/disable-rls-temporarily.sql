-- RLS'yi Geçici Olarak Kapatma Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi geçici olarak kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 3. Mevcut politikaları kontrol et
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Test için manuel profil oluştur
-- Bu sorguyu manuel olarak test edin:
-- INSERT INTO profiles (id, username, email) VALUES (gen_random_uuid(), 'test_user', 'test@example.com');

-- 5. Test sonrası RLS'yi tekrar açmak için:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Sonra fix-rls-policies.sql scriptini çalıştırın
