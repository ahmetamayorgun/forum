-- Notification System Test Script
-- Bu script bildirim sisteminin düzgün çalışıp çalışmadığını test eder

-- 1. Mevcut kullanıcıları kontrol et
SELECT 
    id,
    email,
    created_at
FROM auth.users
LIMIT 5;

-- 2. Notification tablolarını kontrol et
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences')
ORDER BY table_name, ordinal_position;

-- 3. RLS politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('notifications', 'notification_preferences')
ORDER BY tablename, policyname;

-- 4. Fonksiyonları test et
-- Test 1: Okunmamış sayısını al
SELECT get_unread_notification_count() as unread_count;

-- Test 2: Bildirim özetini al
SELECT * FROM user_notification_summary LIMIT 1;

-- Test 3: Mevcut bildirimleri listele
SELECT 
    id,
    type,
    title,
    message,
    created_at,
    read_at
FROM notifications
ORDER BY created_at DESC
LIMIT 5;

-- 5. Test bildirimi oluştur (eğer kullanıcı varsa)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- İlk kullanıcıyı al
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test bildirimi oluştur
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            test_user_id,
            'system',
            'Test Bildirimi',
            'Bu bir test bildirimidir. Sistem çalışıyor!',
            '{"test": true, "timestamp": "' || NOW() || '"}'
        );
        
        RAISE NOTICE 'Test bildirimi oluşturuldu. User ID: %', test_user_id;
    ELSE
        RAISE NOTICE 'Test kullanıcısı bulunamadı';
    END IF;
END $$;

-- 6. Sonuçları kontrol et
SELECT 
    'Toplam bildirim sayısı:' as metric,
    COUNT(*)::text as value
FROM notifications

UNION ALL

SELECT 
    'Okunmamış bildirim sayısı:' as metric,
    COUNT(*)::text as value
FROM notifications
WHERE read_at IS NULL

UNION ALL

SELECT 
    'Bildirim türleri:' as metric,
    string_agg(DISTINCT type, ', ') as value
FROM notifications

UNION ALL

SELECT 
    'Notification preferences sayısı:' as metric,
    COUNT(*)::text as value
FROM notification_preferences;

-- 7. Son test bildirimini göster
SELECT 
    id,
    type,
    title,
    message,
    created_at,
    data
FROM notifications
WHERE data->>'test' = 'true'
ORDER BY created_at DESC
LIMIT 1;
