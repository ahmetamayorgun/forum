-- 🔧 Basit Kayıt Düzeltme Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi geçici olarak kapat (test için)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Trigger'ı geçici olarak kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Mevcut profilleri kontrol et
SELECT 'Current profiles:' as info;
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'Current auth users:' as info;
SELECT COUNT(*) as auth_user_count FROM auth.users;

-- 4. Eksik profilleri oluştur
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

-- 5. Basit RLS politikaları oluştur
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eski politikaları temizle
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Yeni basit politikalar
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Basit trigger oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.email,
    NOW(),
    NOW()
  );
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

-- 7. Sonuçları kontrol et
SELECT '✅ Fix completed! Results:' as status;

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
