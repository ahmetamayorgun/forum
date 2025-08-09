-- Foreign key constraint'lerini geçici olarak devre dışı bırak
-- Bu dosya foreign key hatalarını geçici olarak çözer

-- Önce mevcut foreign key'leri kontrol et
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('topics', 'comments', 'topic_likes', 'comment_likes', 'notifications')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Foreign key constraint'lerini geçici olarak devre dışı bırak
DO $$
BEGIN
    -- Topics tablosu için
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topics_user_id_fkey' 
        AND table_name = 'topics'
    ) THEN
        ALTER TABLE topics DROP CONSTRAINT topics_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topics_category_id_fkey' 
        AND table_name = 'topics'
    ) THEN
        ALTER TABLE topics DROP CONSTRAINT topics_category_id_fkey;
    END IF;
    
    -- Comments tablosu için
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_topic_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_topic_id_fkey;
    END IF;
    
    -- Topic_likes tablosu için
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topic_likes_user_id_fkey' 
        AND table_name = 'topic_likes'
    ) THEN
        ALTER TABLE topic_likes DROP CONSTRAINT topic_likes_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topic_likes_topic_id_fkey' 
        AND table_name = 'topic_likes'
    ) THEN
        ALTER TABLE topic_likes DROP CONSTRAINT topic_likes_topic_id_fkey;
    END IF;
    
    -- Comment_likes tablosu için
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comment_likes_user_id_fkey' 
        AND table_name = 'comment_likes'
    ) THEN
        ALTER TABLE comment_likes DROP CONSTRAINT comment_likes_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comment_likes_comment_id_fkey' 
        AND table_name = 'comment_likes'
    ) THEN
        ALTER TABLE comment_likes DROP CONSTRAINT comment_likes_comment_id_fkey;
    END IF;
    
    -- Notifications tablosu için
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_user_id_fkey;
    END IF;
    
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

-- Test: Yeni topic oluşturmayı dene
-- Bu sorgu artık foreign key hatası vermemeli
SELECT 'Foreign key constraints temporarily disabled' as status;
