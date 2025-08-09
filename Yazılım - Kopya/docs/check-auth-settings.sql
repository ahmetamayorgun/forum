-- 🔍 Auth Ayarlarını Kontrol Et
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT '=== CURRENT STATUS ===' as info;
SELECT 'Auth users count:' as label, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

-- 2. RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Politikaları kontrol et
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Trigger'ları kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- 5. Son kullanıcıları kontrol et
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Son profilleri kontrol et
SELECT 
  id,
  username,
  email,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

SELECT '✅ Auth settings check completed!' as result;
