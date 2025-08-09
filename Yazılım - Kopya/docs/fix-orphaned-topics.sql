-- Orphaned topics ve comments verilerini temizle
-- Bu dosya profiles tablosunda olmayan user_id'lere sahip verileri düzeltir

-- Önce orphaned topics'leri kontrol et
SELECT 
    t.id,
    t.title,
    t.user_id,
    t.created_at
FROM topics t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL;

-- Orphaned comments'leri kontrol et
SELECT 
    c.id,
    c.content,
    c.user_id,
    c.topic_id,
    c.created_at
FROM comments c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE p.id IS NULL;

-- Orphaned topic_likes'ları kontrol et
SELECT 
    tl.id,
    tl.user_id,
    tl.topic_id,
    tl.like_type,
    tl.created_at
FROM topic_likes tl
LEFT JOIN profiles p ON tl.user_id = p.id
WHERE p.id IS NULL;

-- Orphaned comment_likes'ları kontrol et
SELECT 
    cl.id,
    cl.user_id,
    cl.comment_id,
    cl.like_type,
    cl.created_at
FROM comment_likes cl
LEFT JOIN profiles p ON cl.user_id = p.id
WHERE p.id IS NULL;

-- Orphaned notifications'ları kontrol et
SELECT 
    n.id,
    n.user_id,
    n.title,
    n.message,
    n.created_at
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE p.id IS NULL;

-- Şimdi orphaned verileri temizle (DİKKAT: Bu işlem geri alınamaz!)

-- 1. Orphaned topic_likes'ları sil
DELETE FROM topic_likes 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 2. Orphaned comment_likes'ları sil
DELETE FROM comment_likes 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 3. Orphaned notifications'ları sil
DELETE FROM notifications 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 4. Orphaned comments'leri sil
DELETE FROM comments 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 5. Orphaned topics'leri sil
DELETE FROM topics 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Sonuçları kontrol et
SELECT 'topics' as table_name, COUNT(*) as orphaned_count
FROM topics t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'comments' as table_name, COUNT(*) as orphaned_count
FROM comments c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'topic_likes' as table_name, COUNT(*) as orphaned_count
FROM topic_likes tl
LEFT JOIN profiles p ON tl.user_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'comment_likes' as table_name, COUNT(*) as orphaned_count
FROM comment_likes cl
LEFT JOIN profiles p ON cl.user_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as orphaned_count
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE p.id IS NULL;

-- Eğer hala orphaned veri varsa, foreign key constraint'lerini geçici olarak devre dışı bırak
-- Bu sadece son çare olarak kullanılmalı

-- Foreign key constraint'lerini geçici olarak devre dışı bırak
ALTER TABLE topics DISABLE TRIGGER ALL;
ALTER TABLE comments DISABLE TRIGGER ALL;
ALTER TABLE topic_likes DISABLE TRIGGER ALL;
ALTER TABLE comment_likes DISABLE TRIGGER ALL;
ALTER TABLE notifications DISABLE TRIGGER ALL;

-- RLS'yi geçici olarak devre dışı bırak
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE topic_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Şimdi kalan orphaned verileri manuel olarak temizle
-- Bu sorguları tek tek çalıştırın ve sonuçları kontrol edin

-- Kalan orphaned topics'leri sil
DELETE FROM topics 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Kalan orphaned comments'leri sil
DELETE FROM comments 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Kalan orphaned likes'ları sil
DELETE FROM topic_likes 
WHERE user_id NOT IN (SELECT id FROM profiles);

DELETE FROM comment_likes 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Kalan orphaned notifications'ları sil
DELETE FROM notifications 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Trigger'ları ve RLS'yi tekrar etkinleştir
ALTER TABLE topics ENABLE TRIGGER ALL;
ALTER TABLE comments ENABLE TRIGGER ALL;
ALTER TABLE topic_likes ENABLE TRIGGER ALL;
ALTER TABLE comment_likes ENABLE TRIGGER ALL;
ALTER TABLE notifications ENABLE TRIGGER ALL;

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Final kontrol
SELECT 'CLEANUP COMPLETE' as status;
