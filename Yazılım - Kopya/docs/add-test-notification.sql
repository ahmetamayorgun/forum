-- Test Bildirimi Ekle
-- Bu script test için bir bildirim ekler

-- 1. Mevcut kullanıcıları kontrol et
SELECT 'Current users:' as info;
SELECT id, email FROM auth.users LIMIT 5;

-- 2. Test bildirimi ekle (ilk kullanıcıya)
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    u.id,
    'system',
    'Test Bildirimi',
    'Bu bir test bildirimidir. Bildirim sistemi çalışıyor!',
    '{"test": true}'::jsonb
FROM auth.users u
LIMIT 1
RETURNING id, user_id, type, title, message, created_at;

-- 3. Eklenen bildirimi kontrol et
SELECT 'Added notification:' as info;
SELECT 
    id,
    user_id,
    type,
    title,
    message,
    read_at,
    created_at
FROM notifications 
WHERE title = 'Test Bildirimi'
ORDER BY created_at DESC
LIMIT 1;

-- 4. Okunmamış bildirim sayısını kontrol et
SELECT 'Unread count after adding test notification:' as info;
SELECT get_unread_notification_count() as unread_count;

-- 5. Bildirim özetini kontrol et
SELECT 'Notification summary:' as info;
SELECT * FROM user_notification_summary;
