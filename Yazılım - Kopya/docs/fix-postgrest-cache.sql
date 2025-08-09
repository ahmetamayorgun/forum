-- PostgREST cache'ini temizle ve foreign key'leri yeniden oluştur
-- Bu dosya Supabase'in schema cache sorununu çözer

-- 1. Önce mevcut foreign key'leri tamamen temizle
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Tüm foreign key constraint'lerini kaldır
    FOR constraint_record IN 
        SELECT table_name, constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name IN ('topics', 'comments', 'topic_likes', 'comment_likes', 'notifications')
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %.%', constraint_record.table_name, constraint_record.constraint_name;
    END LOOP;
END $$;

-- 2. PostgREST cache'ini temizle
NOTIFY pgrst, 'reload schema';

-- 3. Kısa bir bekleme süresi (cache temizlenmesi için)
SELECT pg_sleep(2);

-- 4. Foreign key'leri yeniden oluştur (sadece geçerli veriler için)
-- Önce orphaned verileri temizle
DELETE FROM topic_likes WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM comment_likes WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM comments WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM topics WHERE user_id NOT IN (SELECT id FROM profiles);

-- 5. Foreign key constraint'lerini yeniden oluştur
ALTER TABLE topics 
ADD CONSTRAINT topics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE topics 
ADD CONSTRAINT topics_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;

ALTER TABLE topic_likes 
ADD CONSTRAINT topic_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE topic_likes 
ADD CONSTRAINT topic_likes_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;

ALTER TABLE comment_likes 
ADD CONSTRAINT comment_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comment_likes 
ADD CONSTRAINT comment_likes_comment_id_fkey 
FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 6. PostgREST cache'ini tekrar temizle
NOTIFY pgrst, 'reload schema';

-- 7. Sonuçları kontrol et
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('topics', 'comments', 'topic_likes', 'comment_likes', 'notifications')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- 8. Test sorgusu
SELECT 'Schema cache cleared and foreign keys recreated successfully' as status;
