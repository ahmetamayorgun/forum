-- 🔧 Foreign Key Constraint Hatası Düzeltme Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT '=== CURRENT STATUS ===' as info;
SELECT 'Auth users count:' as label, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

-- 2. Geçersiz foreign key'leri bul
SELECT '=== INVALID FOREIGN KEYS ===' as info;
SELECT 
  p.id as profile_id,
  p.username,
  p.email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- 3. Geçersiz profilleri sil
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 4. RLS'yi kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Trigger'ı kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 6. Profiles tablosunu yeniden oluştur (foreign key constraint ile)
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Mevcut auth users için profilleri oluştur
INSERT INTO profiles (id, username, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- 8. RLS'yi aç
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. Politikaları oluştur
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. Güvenli trigger oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Önce auth.users tablosunda kullanıcının var olduğundan emin ol
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = new.id) THEN
    INSERT INTO public.profiles (id, username, email, created_at, updated_at)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
      new.email,
      NOW(),
      NOW()
    );
  END IF;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Sonuçları kontrol et
SELECT '=== FINAL STATUS ===' as info;
SELECT 'Auth users count:' as label, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

-- 12. Foreign key constraint'leri kontrol et
SELECT '=== FOREIGN KEY CHECK ===' as info;
SELECT 
  'Profiles without auth users:' as check_type,
  COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

SELECT '✅ Foreign key fix completed!' as result;
