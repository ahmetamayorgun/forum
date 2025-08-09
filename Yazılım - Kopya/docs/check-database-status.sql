-- Veritabanı Durumu Kontrol Scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- 1. Profiles tablosunu kontrol et
SELECT 
  'Profiles table structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. RLS politikalarını kontrol et
SELECT 
  'RLS Policies' as check_type,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Trigger'ları kontrol et
SELECT 
  'Triggers' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- 4. Kullanıcı ve profil sayılarını kontrol et
SELECT 
  'User counts' as check_type,
  'Auth users' as type,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'User counts' as check_type,
  'Profiles' as type,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  'User counts' as check_type,
  'Users without profiles' as type,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Son 10 kullanıcıyı kontrol et
SELECT 
  'Recent users' as check_type,
  au.id,
  au.email,
  au.created_at as auth_created,
  p.username,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 6. RLS'nin etkin olup olmadığını kontrol et
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
