-- Authentication ve profiles tablosu sorunlarını düzelt
-- Bu dosya auth.users ile profiles tablosu arasındaki senkronizasyonu sağlar

-- 1. Mevcut auth.users'ları kontrol et
SELECT 'Auth users check' as test_name,
       id,
       email,
       raw_user_meta_data,
       created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Profiles tablosundaki kullanıcıları kontrol et
SELECT 'Profiles check' as test_name,
       id,
       username,
       email,
       created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Auth.users'da olup profiles'da olmayan kullanıcıları bul
SELECT 'Missing profiles' as test_name,
       au.id,
       au.email,
       au.raw_user_meta_data->>'username' as username_from_auth,
       au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 4. Eksik profilleri oluştur
DO $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN 
        SELECT 
            au.id,
            au.email,
            COALESCE(au.raw_user_meta_data->>'username', 'user_' || substring(au.id::text from 1 for 8)) as username,
            au.created_at
        FROM auth.users au
        LEFT JOIN profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        INSERT INTO profiles (id, username, email, created_at)
        VALUES (
            auth_user.id,
            auth_user.username,
            auth_user.email,
            auth_user.created_at
        );
        RAISE NOTICE 'Created profile for user: % (%)', auth_user.username, auth_user.id;
    END LOOP;
END $$;

-- 5. User points tablosunu da kontrol et ve eksik kayıtları oluştur
DO $$
DECLARE
    profile_user RECORD;
BEGIN
    FOR profile_user IN 
        SELECT p.id, p.username
        FROM profiles p
        LEFT JOIN user_points up ON p.id = up.user_id
        WHERE up.user_id IS NULL
    LOOP
        INSERT INTO user_points (user_id, points, created_at, updated_at)
        VALUES (
            profile_user.id,
            0,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created user_points for: % (%)', profile_user.username, profile_user.id;
    END LOOP;
END $$;

-- 6. Sonuçları kontrol et
SELECT 'Final check - profiles count' as test_name,
       COUNT(*) as total_profiles
FROM profiles;

SELECT 'Final check - user_points count' as test_name,
       COUNT(*) as total_user_points
FROM user_points;

-- 7. Test kullanıcısını kontrol et
SELECT 'Test user final check' as test_name,
       p.id,
       p.username,
       p.email,
       up.points,
       p.created_at
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id
WHERE p.username = 'saidpamuk2k4'
   OR p.email = 'saidpamuk2k4@gmail.com'
LIMIT 1;
