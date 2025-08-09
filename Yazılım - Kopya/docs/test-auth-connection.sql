-- Authentication ve database bağlantısını test et
-- Bu dosya temel bağlantıları kontrol eder

-- 1. Supabase bağlantısını test et
SELECT 'Supabase connection test' as test_name, 
       current_database() as database_name,
       current_user as current_user,
       version() as postgres_version;

-- 2. Profiles tablosunu kontrol et
SELECT 'Profiles table test' as test_name,
       COUNT(*) as total_profiles
FROM profiles;

-- 3. Auth tablolarını kontrol et
SELECT 'Auth tables test' as test_name,
       schemaname,
       tablename
FROM pg_tables
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 4. RLS durumunu kontrol et
SELECT 'RLS status test' as test_name,
       schemaname,
       tablename,
       rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'topics', 'comments')
ORDER BY tablename;

-- 5. Foreign key durumunu kontrol et
SELECT 'Foreign key test' as test_name,
       tc.table_name, 
       tc.constraint_name, 
       tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('profiles', 'topics', 'comments')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- 6. Test kullanıcısı oluştur (eğer yoksa)
DO $$
BEGIN
    -- Eğer test kullanıcısı yoksa oluştur
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'test_user') THEN
        INSERT INTO profiles (id, username, email, created_at)
        VALUES (
            gen_random_uuid(),
            'test_user',
            'test@example.com',
            NOW()
        );
        RAISE NOTICE 'Test user created';
    ELSE
        RAISE NOTICE 'Test user already exists';
    END IF;
END $$;

-- 7. Test kullanıcısını kontrol et
SELECT 'Test user check' as test_name,
       id,
       username,
       email,
       created_at
FROM profiles
WHERE username = 'test_user'
LIMIT 1;
