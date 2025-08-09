-- Notifications System Setup Check
-- Bu script mevcut durumu kontrol etmek için kullanılır

-- 1. Tabloları kontrol et
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

-- 2. Policy'leri kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('notifications', 'notification_preferences')
ORDER BY tablename, policyname;

-- 3. Fonksiyonları kontrol et
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('create_notification', 'mark_notification_as_read', 'mark_all_notifications_as_read', 'get_unread_notification_count', 'create_user_notification_preferences') THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_notification', 'mark_notification_as_read', 'mark_all_notifications_as_read', 'get_unread_notification_count', 'create_user_notification_preferences')
ORDER BY routine_name;

-- 4. Trigger'ları kontrol et
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    CASE 
        WHEN trigger_name = 'trigger_create_user_notification_preferences' THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_user_notification_preferences';

-- 5. View'ı kontrol et
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'user_notification_summary' THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'user_notification_summary';

-- 6. Index'leri kontrol et
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname LIKE 'idx_notifications%' OR indexname LIKE 'idx_notification_preferences%' THEN '✅ Mevcut'
        ELSE '❌ Eksik'
    END as status
FROM pg_indexes 
WHERE tablename IN ('notifications', 'notification_preferences')
ORDER BY tablename, indexname;
