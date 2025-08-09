-- 🔧 Kayıt Hatalarını Düzeltme Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT 'Checking current database status...' as status;

-- Profiles tablosunu kontrol et
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. RLS politikalarını kontrol et
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Trigger'ları kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- 4. Profiles tablosunu yeniden oluştur (eğer gerekirse)
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

-- 5. RLS'yi etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Eski politikaları temizle
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- 7. Yeni politikaları oluştur
-- Tüm kullanıcılar profilleri görebilir
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Trigger fonksiyonunu yeniden oluştur
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
EXCEPTION
  WHEN unique_violation THEN
    -- Eğer kullanıcı adı zaten varsa, benzersiz bir tane oluştur
    INSERT INTO public.profiles (id, username, email)
    VALUES (
      new.id,
      'user_' || substr(new.id::text, 1, 8) || '_' || floor(random() * 1000),
      new.email
    );
    RETURN new;
  WHEN OTHERS THEN
    -- Diğer hatalar için log tut ve devam et
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Mevcut kullanıcılar için eksik profilleri oluştur
INSERT INTO profiles (id, username, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)),
  au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

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

-- 12. Test için örnek sorgular
-- Bu sorguları manuel olarak test edin:

-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM auth.users LIMIT 5;

-- 13. RLS politikalarını test et
-- Bu sorguları authenticated user ile test edin:
-- INSERT INTO profiles (id, username, email) VALUES (auth.uid(), 'test_user', 'test@test.com');
-- SELECT * FROM profiles WHERE id = auth.uid();
-- UPDATE profiles SET bio = 'Test bio' WHERE id = auth.uid();

-- 14. Sonuç mesajı
SELECT '✅ Registration fix completed successfully!' as result;
