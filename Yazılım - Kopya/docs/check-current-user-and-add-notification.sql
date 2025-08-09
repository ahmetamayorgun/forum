-- Kullanıcı Kontrolü ve Test Bildirimi Ekleme
-- Bu script önce mevcut kullanıcıyı kontrol eder, sonra test bildirimi ekler

-- 1. Mevcut kullanıcıyı kontrol et
SELECT 'Current user check:' as info;
SELECT auth.uid() as current_user_id;

-- 2. Eğer auth.uid() null ise, mevcut kullanıcıları listele
SELECT 'Available users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 3. İlk kullanıcı için test bildirimi ekle (auth.uid() null ise)
-- Bu kısmı manuel olarak çalıştırın, kullanıcı ID'sini değiştirin
/*
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
    'BURAYA_KULLANICI_ID_YAZIN',  -- auth.users tablosundan aldığınız ID'yi buraya yazın
    'system',
    'Test Bildirimi',
    'Bu bir test bildirimidir. Bildirim sistemi çalışıyor!',
    '{"test": true}'::jsonb
)
RETURNING id, user_id, type, title, message, created_at;
*/

-- 4. Mevcut bildirimleri kontrol et
SELECT 'Current notifications:' as info;
SELECT 
    id,
    user_id,
    type,
    title,
    message,
    created_at
FROM notifications 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Bildirim özetini kontrol et
SELECT 'Notification summary:' as info;
SELECT * FROM user_notification_summary;
