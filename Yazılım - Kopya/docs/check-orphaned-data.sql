-- Orphaned verileri kontrol et (GÜVENLİ - SADECE KONTROL)
-- Bu dosya sadece profiles tablosunda olmayan user_id'lere sahip verileri listeler

-- Orphaned topics'leri kontrol et
SELECT 
    'topics' as table_name,
    COUNT(*) as orphaned_count,
    'Orphaned topics found' as message
FROM topics t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL

UNION ALL

-- Orphaned comments'leri kontrol et
SELECT 
    'comments' as table_name,
    COUNT(*) as orphaned_count,
    'Orphaned comments found' as message
FROM comments c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE p.id IS NULL

UNION ALL

-- Orphaned topic_likes'ları kontrol et
SELECT 
    'topic_likes' as table_name,
    COUNT(*) as orphaned_count,
    'Orphaned topic likes found' as message
FROM topic_likes tl
LEFT JOIN profiles p ON tl.user_id = p.id
WHERE p.id IS NULL

UNION ALL

-- Orphaned comment_likes'ları kontrol et
SELECT 
    'comment_likes' as table_name,
    COUNT(*) as orphaned_count,
    'Orphaned comment likes found' as message
FROM comment_likes cl
LEFT JOIN profiles p ON cl.user_id = p.id
WHERE p.id IS NULL

UNION ALL

-- Orphaned notifications'ları kontrol et
SELECT 
    'notifications' as table_name,
    COUNT(*) as orphaned_count,
    'Orphaned notifications found' as message
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE p.id IS NULL;

-- Detaylı orphaned topics listesi
SELECT 
    t.id,
    t.title,
    t.user_id,
    t.created_at,
    'This topic has no valid user' as issue
FROM topics t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL
ORDER BY t.created_at DESC;

-- Detaylı orphaned comments listesi
SELECT 
    c.id,
    LEFT(c.content, 50) as content_preview,
    c.user_id,
    c.topic_id,
    c.created_at,
    'This comment has no valid user' as issue
FROM comments c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE p.id IS NULL
ORDER BY c.created_at DESC;

-- Profiles tablosundaki mevcut kullanıcıları listele
SELECT 
    id,
    username,
    email,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
