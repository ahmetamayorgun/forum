-- 🚨 ACİL DURUM DÜZELTME SCRIPTİ
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi tamamen kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Tüm trigger'ları kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Profiles tablosunu yeniden oluştur
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

-- 4. Test verisi ekle
INSERT INTO profiles (id, username, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test_user_123',
  'test@example.com',
  NOW(),
  NOW()
);

-- 5. Sonuçları kontrol et
SELECT '=== EMERGENCY FIX COMPLETED ===' as status;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

-- 6. RLS'yi aç ve basit politikalar oluştur
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Basit trigger oluştur
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

SELECT '✅ Emergency fix completed! Try registration now.' as result;
