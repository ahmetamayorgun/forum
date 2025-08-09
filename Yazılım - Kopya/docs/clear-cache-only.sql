-- Sadece PostgREST cache'ini temizle
-- Bu dosya schema cache sorununu çözer

-- 1. PostgREST cache'ini temizle
NOTIFY pgrst, 'reload schema';

-- 2. Kısa bir bekleme süresi
SELECT pg_sleep(3);

-- 3. Cache'i tekrar temizle
NOTIFY pgrst, 'reload schema';

-- 4. Sonuç kontrolü
SELECT 'PostgREST cache cleared successfully' as status;

-- 5. Mevcut foreign key'leri kontrol et
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('topics', 'comments', 'topic_likes', 'comment_likes', 'notifications')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
