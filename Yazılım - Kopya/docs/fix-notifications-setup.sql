-- Notifications System Setup Fix
-- Bu script eksik olan constraint'leri ve yapıları tamamlar

-- 1. Eksik constraint'leri ekle (eğer yoksa)
DO $$ 
BEGIN
    -- notifications tablosu için primary key
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_pkey'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
    END IF;

    -- notification_preferences tablosu için primary key
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notification_preferences_pkey'
    ) THEN
        ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);
    END IF;

    -- notification_preferences tablosu için unique constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notification_preferences_user_id_key'
    ) THEN
        ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);
    END IF;

    -- notifications tablosu için foreign key (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- notification_preferences tablosu için foreign key (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notification_preferences_user_id_fkey'
    ) THEN
        ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

END $$;

-- 2. Eksik fonksiyonları oluştur (eğer yoksa)
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications 
    SET read_at = NOW()
    WHERE id = p_notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read_at = NOW()
    WHERE user_id = auth.uid() AND read_at IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = auth.uid() AND read_at IS NULL;
    
    RETURN count_result;
END;
$$;

CREATE OR REPLACE FUNCTION create_user_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 3. Trigger'ı oluştur (eğer yoksa)
DROP TRIGGER IF EXISTS trigger_create_user_notification_preferences ON auth.users;
CREATE TRIGGER trigger_create_user_notification_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_notification_preferences();

-- 4. View'ı oluştur (eğer yoksa)
CREATE OR REPLACE VIEW user_notification_summary AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read_at IS NULL) as unread_count,
    COUNT(*) FILTER (WHERE type = 'comment') as comment_count,
    COUNT(*) FILTER (WHERE type = 'like') as like_count,
    COUNT(*) FILTER (WHERE type = 'mention') as mention_count,
    COUNT(*) FILTER (WHERE type = 'follow') as follow_count,
    COUNT(*) FILTER (WHERE type = 'system') as system_count,
    MAX(created_at) as latest_notification
FROM notifications
GROUP BY user_id;

-- 5. Mevcut kullanıcılar için notification preferences oluştur (eğer yoksa)
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Test verisi ekle (opsiyonel - sadece test için)
-- Bu kısmı yorum satırı olarak bırakıyorum, test etmek isterseniz açabilirsiniz
/*
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    u.id,
    'system',
    'Hoş Geldiniz!',
    'Bildirim sistemine hoş geldiniz!',
    '{"welcome": true}'
FROM auth.users u
WHERE u.id NOT IN (
    SELECT DISTINCT user_id 
    FROM notifications 
    WHERE type = 'system' AND title = 'Hoş Geldiniz!'
)
LIMIT 1;
*/

-- 7. Sonuçları kontrol et
SELECT '✅ Notifications system setup completed!' as status;
