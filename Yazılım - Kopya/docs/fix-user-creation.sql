-- Kullanıcı oluşturma sorununu çözmek için SQL script
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut durumu kontrol et
SELECT 'Current RLS status' as info, 
       schemaname, 
       tablename, 
       rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_points', 'auth.users');

-- 2. Profiles tablosu için RLS'yi geçici olarak devre dışı bırak
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. User_points tablosu için RLS'yi geçici olarak devre dışı bırak
ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;

-- 4. Mevcut trigger'ları kontrol et
SELECT 'Current triggers' as info,
       trigger_name,
       event_manipulation,
       action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table IN ('profiles', 'user_points');

-- 5. Profiles tablosu için trigger'ları geçici olarak devre dışı bırak
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
          AND event_object_table = 'profiles'
    LOOP
        EXECUTE format('ALTER TABLE profiles DISABLE TRIGGER %I', trigger_record.trigger_name);
        RAISE NOTICE 'Disabled trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 6. User_points tablosu için trigger'ları geçici olarak devre dışı bırak
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
          AND event_object_table = 'user_points'
    LOOP
        EXECUTE format('ALTER TABLE user_points DISABLE TRIGGER %I', trigger_record.trigger_name);
        RAISE NOTICE 'Disabled trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 7. Tabloların yapısını kontrol et
SELECT 'Profiles table structure' as info, 
       column_name, 
       data_type, 
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 'User_points table structure' as info, 
       column_name, 
       data_type, 
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'user_points' 
ORDER BY ordinal_position;

-- 8. Foreign key constraint'leri kontrol et
SELECT 'Foreign key constraints' as info,
       tc.constraint_name,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('profiles', 'user_points');

-- 9. Test kullanıcısı oluşturma talimatları
SELECT 'MANUAL USER CREATION STEPS' as info,
       '1. Go to Supabase Dashboard > Authentication > Users' as step1,
       '2. Click "Add User" button' as step2,
       '3. Enter email: demo@test.com' as step3,
       '4. Enter password: demo123' as step4,
       '5. Set metadata: {"username": "demouser"}' as step5,
       '6. Click "Create User"' as step6,
       '7. If successful, run the profile creation script' as step7;

-- 10. Profil oluşturma script'i (kullanıcı oluşturulduktan sonra çalıştırın)
-- Bu kısmı kullanıcı oluşturduktan sonra çalıştırın
/*
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Test kullanıcısının ID'sini al
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'demo@test.com';
  
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
      'demouser',
      'demo@test.com',
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
    
    RAISE NOTICE 'Profile and points created for user ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'User not found in auth.users';
  END IF;
END $$;
*/

-- 11. RLS'yi tekrar etkinleştirme talimatları
SELECT 'AFTER USER CREATION - RE-ENABLE RLS' as info,
       'Run these commands after successful user creation:' as note,
       'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' as cmd1,
       'ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;' as cmd2;
