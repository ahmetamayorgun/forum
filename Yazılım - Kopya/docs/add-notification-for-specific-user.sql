-- Belirli Kullanıcı İçin Test Bildirimi Ekleme
-- Bu script belirtilen kullanıcı ID'si için test bildirimi ekler

-- Kullanıcı ID'sini buraya yazın (console'dan aldığınız ID'yi)
-- Örnek: '63848083-abf1-4ca7-bb65-557dae51b791'

-- Test bildirimi ekle (İlk kullanıcı için)
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
    '63848083-abf1-4ca7-bb65-557dae51b791',
    'system',
    'Test Bildirimi - Kullanıcı 1',
    'Bu bir test bildirimidir. Bildirim sistemi çalışıyor! (Kullanıcı 1)',
    '{"test": true, "user": "1"}'::jsonb
)
RETURNING id, user_id, type, title, message, created_at;

-- Test bildirimi ekle (İkinci kullanıcı için)
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
    '8b0b786e-4dd8-4c3a-958d-810f5dc56dbf',
    'system',
    'Test Bildirimi - Kullanıcı 2',
    'Bu bir test bildirimidir. Bildirim sistemi çalışıyor! (Kullanıcı 2)',
    '{"test": true, "user": "2"}'::jsonb
)
RETURNING id, user_id, type, title, message, created_at;

-- Eklenen bildirimi kontrol et
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

-- Okunmamış bildirim sayısını kontrol et
SELECT 'Unread count:' as info;
SELECT get_unread_notification_count() as unread_count;

-- Bildirim özetini kontrol et
SELECT 'Notification summary:' as info;
SELECT * FROM user_notification_summary;
