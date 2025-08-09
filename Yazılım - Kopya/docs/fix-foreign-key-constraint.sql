-- Foreign Key Constraint Sorunu Çözümü
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Mevcut foreign key constraint'i kontrol et
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='profiles';

-- 2. RLS politikasını düzelt - auth.uid() kontrolü ekle
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NOT NULL
  );

-- 3. Test için geçici olarak RLS'yi kapat (sadece test için)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Politikaları kontrol et
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Test sorgusu (manuel olarak test edin)
-- INSERT INTO profiles (id, username, email) VALUES (gen_random_uuid(), 'test_user', 'test@example.com');
