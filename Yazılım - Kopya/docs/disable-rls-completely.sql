-- 🚨 RLS'yi Tamamen Kapat
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Tüm trigger'ları kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Tüm politikaları sil
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 4. Test verisi ekle
INSERT INTO profiles (id, username, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test_user_' || floor(random() * 10000),
  'test' || floor(random() * 10000) || '@test.com',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 5. Sonuçları kontrol et
SELECT '=== RLS DISABLED ===' as info;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

SELECT '✅ RLS completely disabled! Try registration now.' as result;

