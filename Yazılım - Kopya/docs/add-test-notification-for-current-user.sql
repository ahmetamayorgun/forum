-- Test Bildirimi Ekle (Mevcut Kullanıcı İçin)
-- Bu script mevcut giriş yapmış kullanıcı için test bildirimi ekler

-- 1. Mevcut kullanıcıyı kontrol et
SELECT 'Current user:' as info;
SELECT auth.uid() as current_user_id;

-- 2. Test bildirimi ekle (mevcut kullanıcıya)
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
    auth.uid(),
    'system',
    'Test Bildirimi',
    'Bu bir test bildirimidir. Bildirim sistemi çalışıyor!',
    '{"test": true}'::jsonb
)
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
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- 4. Okunmamış bildirim sayısını kontrol et
SELECT 'Unread count for current user:' as info;
SELECT get_unread_notification_count() as unread_count;

-- 5. Bildirim özetini kontrol et
SELECT 'Notification summary for current user:' as info;
SELECT * FROM user_notification_summary WHERE user_id = auth.uid();
