-- Notifications System Test
-- Bu script bildirim sisteminin çalışıp çalışmadığını test eder

-- 1. Tabloları kontrol et
SELECT 'TABLES CHECK' as test_type;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'notifications' THEN '✅ Mevcut'
        WHEN table_name = 'notification_preferences' THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences');

-- 2. Fonksiyonları kontrol et
SELECT 'FUNCTIONS CHECK' as test_type;

SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('create_notification', 'mark_notification_as_read', 'mark_all_notifications_as_read', 'get_unread_notification_count') THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_notification', 'mark_notification_as_read', 'mark_all_notifications_as_read', 'get_unread_notification_count')
ORDER BY routine_name;

-- 3. View'ı kontrol et
SELECT 'VIEW CHECK' as test_type;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'user_notification_summary' THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'user_notification_summary';

-- 4. Basit test verisi ekle (eğer tablolar varsa)
SELECT 'DATA TEST' as test_type;

-- Mevcut kullanıcıları kontrol et
SELECT 
    'Users count' as info,
    COUNT(*) as count
FROM auth.users;

-- Notification preferences kontrol et
SELECT 
    'Notification preferences count' as info,
    COUNT(*) as count
FROM notification_preferences;

-- Notifications kontrol et
SELECT 
    'Notifications count' as info,
    COUNT(*) as count
FROM notifications;

-- 5. RPC fonksiyonunu test et
SELECT 'RPC TEST' as test_type;

-- Bu fonksiyonu çağırmaya çalış
SELECT get_unread_notification_count() as unread_count;
