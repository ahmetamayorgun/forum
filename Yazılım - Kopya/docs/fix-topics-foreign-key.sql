-- Topics tablosu için eksik foreign key constraint'ini oluştur
-- Bu dosya topics tablosu ile profiles tablosu arasındaki ilişkiyi düzeltir

-- Önce mevcut foreign key'i kontrol et ve varsa sil
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topics_user_id_fkey' 
        AND table_name = 'topics'
    ) THEN
        ALTER TABLE topics DROP CONSTRAINT topics_user_id_fkey;
    END IF;
END $$;

-- Yeni foreign key constraint'ini oluştur
ALTER TABLE topics 
ADD CONSTRAINT topics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Comments tablosu için de aynı işlemi yap
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
    END IF;
END $$;

-- Comments tablosu için foreign key constraint'ini oluştur
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Topics tablosu için category foreign key'ini de kontrol et
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topics_category_id_fkey' 
        AND table_name = 'topics'
    ) THEN
        ALTER TABLE topics DROP CONSTRAINT topics_category_id_fkey;
    END IF;
END $$;

-- Topics tablosu için category foreign key constraint'ini oluştur
ALTER TABLE topics 
ADD CONSTRAINT topics_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Comments tablosu için topic foreign key'ini de kontrol et
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_topic_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_topic_id_fkey;
    END IF;
END $$;

-- Comments tablosu için topic foreign key constraint'ini oluştur
ALTER TABLE comments 
ADD CONSTRAINT comments_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;

-- Sonuçları kontrol et
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
WHERE tc.table_name IN ('topics', 'comments')
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
