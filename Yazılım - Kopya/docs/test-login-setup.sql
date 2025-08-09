-- Test kullanıcısı oluşturma ve giriş yapma testi için SQL script
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut kullanıcıları kontrol et
SELECT 'Current users in auth.users' as info, COUNT(*) as count FROM auth.users;

-- 2. Test kullanıcısı var mı kontrol et
SELECT 
  'Test user check' as info,
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'test@example.com';

-- 3. Profiles tablosunu kontrol et
SELECT 
  'Profiles table check' as info,
  COUNT(*) as total_profiles
FROM profiles;

-- 4. User_points tablosunu kontrol et
SELECT 
  'User points table check' as info,
  COUNT(*) as total_user_points
FROM user_points;

-- 5. RLS politikalarını kontrol et
SELECT 
  'RLS Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_points')
ORDER BY tablename, policyname;

-- 6. Test kullanıcısı oluşturma talimatları
SELECT 
  'MANUAL TEST USER CREATION' as info,
  '1. Go to Supabase Dashboard > Authentication > Users' as step1,
  '2. Click "Add User" button' as step2,
  '3. Enter: test@example.com' as step3,
  '4. Enter password: test123456' as step4,
  '5. Set metadata: {"username": "testuser"}' as step5,
  '6. Click "Create User"' as step6;

-- 7. Test kullanıcısı giriş bilgileri
SELECT 
  'TEST LOGIN CREDENTIALS' as info,
  'Email: test@example.com' as email,
  'Password: test123456' as password,
  'Username: testuser' as username;

-- 8. Eğer test kullanıcısı varsa profil oluştur
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Test kullanıcısının ID'sini al
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com';
  
  IF test_user_id IS NOT NULL THEN
    -- Profiles tablosuna ekle
    INSERT INTO profiles (
      id,
      username,
      email,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'testuser',
      'test@example.com',
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      updated_at = now();
    
    -- User points tablosuna ekle
    INSERT INTO user_points (
      user_id,
      points,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      0,
      now(),
      now()
    ) ON CONFLICT (user_id) DO UPDATE SET
      points = EXCLUDED.points,
      updated_at = now();
    
    RAISE NOTICE 'Test user profile and points created for user ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user not found in auth.users. Please create manually via Supabase Dashboard.';
  END IF;
END $$;

-- 9. Son kontrol
SELECT 
  'Final check - profiles count' as test_name,
  COUNT(*) as total_profiles
FROM profiles;

SELECT 
  'Final check - user_points count' as test_name,
  COUNT(*) as total_user_points
FROM user_points;

-- 10. Test kullanıcısı final kontrol
SELECT 
  'Test user final check' as test_name,
  p.id,
  p.username,
  p.email,
  up.points,
  p.created_at
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id
WHERE p.username = 'testuser'
   OR p.email = 'test@example.com'
LIMIT 1;
