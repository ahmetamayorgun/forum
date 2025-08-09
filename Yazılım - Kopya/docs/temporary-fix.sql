-- Geçici Çözüm: RLS'yi Kapat ve Test Et
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi geçici olarak kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Test kullanıcısı oluştur
-- Bu kısmı manuel olarak test edin:
-- INSERT INTO profiles (id, username, email) VALUES (gen_random_uuid(), 'testuser', 'test@example.com');

-- 3. RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 4. Mevcut profilleri kontrol et
SELECT 
  id,
  username,
  email,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Test sonrası RLS'yi tekrar açmak için:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Sonra fix-rls-policies.sql scriptini çalıştırın
