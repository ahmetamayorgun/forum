-- Güvenli foreign key constraint kaldırma
-- Bu dosya sadece foreign key constraint'lerini kaldırır, trigger'lara dokunmaz

-- Önce mevcut foreign key'leri listele
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

-- Foreign key constraint'lerini güvenli şekilde kaldır
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Topics tablosu için
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'topics' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name IN (
            'topics_user_id_fkey',
            'topics_category_id_fkey'
        )
    LOOP
        EXECUTE 'ALTER TABLE topics DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
    
    -- Comments tablosu için
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'comments' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name IN (
            'comments_user_id_fkey',
            'comments_topic_id_fkey'
        )
    LOOP
        EXECUTE 'ALTER TABLE comments DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
    
    -- Topic_likes tablosu için
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'topic_likes' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name IN (
            'topic_likes_user_id_fkey',
            'topic_likes_topic_id_fkey'
        )
    LOOP
        EXECUTE 'ALTER TABLE topic_likes DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
    
    -- Comment_likes tablosu için
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'comment_likes' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name IN (
            'comment_likes_user_id_fkey',
            'comment_likes_comment_id_fkey'
        )
    LOOP
        EXECUTE 'ALTER TABLE comment_likes DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
    
    -- Notifications tablosu için
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'notifications' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name IN (
            'notifications_user_id_fkey'
        )
    LOOP
        EXECUTE 'ALTER TABLE notifications DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
    
END $$;

-- Sonuçları kontrol et
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('topics', 'comments', 'topic_likes', 'comment_likes', 'notifications')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Test: Artık foreign key hatası almamalısınız
SELECT 'Foreign key constraints removed successfully' as status;
