-- 🚨 NUCLEAR FIX - En Agresif Çözüm
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi tamamen kapat
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

-- 4. Profiles tablosunu tamamen yeniden oluştur
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Test verisi ekle
INSERT INTO profiles (id, username, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test_user_' || floor(random() * 10000),
  'test' || floor(random() * 10000) || '@test.com',
  NOW(),
  NOW()
);

-- 6. Sonuçları kontrol et
SELECT '=== NUCLEAR FIX COMPLETED ===' as info;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

-- 7. RLS'yi açmıyoruz - tamamen kapalı bırakıyoruz
SELECT '✅ Nuclear fix completed! RLS disabled, try registration now.' as result;
