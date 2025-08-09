-- 🚀 Hızlı Test Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi tamamen kapat (test için)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Trigger'ı kapat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Mevcut durumu kontrol et
SELECT '=== CURRENT STATUS ===' as info;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;
SELECT 'Auth users count:' as label, COUNT(*) as count FROM auth.users;

-- 4. Test kullanıcısı oluştur (eğer yoksa)
INSERT INTO profiles (id, username, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test_user_' || floor(random() * 10000),
  'test' || floor(random() * 10000) || '@test.com',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 5. Sonuçları kontrol et
SELECT '=== AFTER TEST ===' as info;
SELECT 'Profiles count:' as label, COUNT(*) as count FROM profiles;

-- 6. RLS'yi tekrar aç
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Basit politikalar oluştur
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Basit trigger oluştur
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

SELECT '✅ Quick test completed!' as result;
