-- 🔧 Basit Çözüm (Trigger Olmadan)
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Tüm trigger'ları kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Geçersiz profilleri temizle
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 4. Basit politikalar oluştur
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Mevcut auth users için profilleri oluştur
INSERT INTO profiles (id, username, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Sonuçları kontrol et
SELECT '=== SIMPLE FIX COMPLETED ===' as info;
SELECT 'Auth users count:' as label, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

SELECT '✅ Simple fix completed! No trigger, manual profile creation.' as result;
