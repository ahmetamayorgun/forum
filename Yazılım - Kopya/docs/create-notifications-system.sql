    -- Notifications System Database Schema
    -- Bu script Supabase SQL Editor'da çalıştırılmalıdır

    -- 1. Notifications tablosu oluşturma
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('comment', 'like', 'mention', 'follow', 'system')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP WITH TIME ZONE
    );

    -- 2. Index'ler oluşturma (performans için)
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

    -- 3. RLS (Row Level Security) politikaları
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    -- Kullanıcılar sadece kendi bildirimlerini görebilir
    CREATE POLICY "Users can view own notifications" ON notifications
        FOR SELECT USING (auth.uid() = user_id);

    -- Kullanıcılar sadece kendi bildirimlerini güncelleyebilir (read_at için)
    CREATE POLICY "Users can update own notifications" ON notifications
        FOR UPDATE USING (auth.uid() = user_id);

    -- Sistem bildirimleri oluşturabilir (admin fonksiyonları için)
    CREATE POLICY "System can create notifications" ON notifications
        FOR INSERT WITH CHECK (true);

    -- 4. Notification preferences tablosu (kullanıcı tercihleri için)
    CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        browser_notifications BOOLEAN DEFAULT TRUE,
        desktop_notifications BOOLEAN DEFAULT TRUE,
        comment_notifications BOOLEAN DEFAULT TRUE,
        like_notifications BOOLEAN DEFAULT TRUE,
        mention_notifications BOOLEAN DEFAULT TRUE,
        follow_notifications BOOLEAN DEFAULT TRUE,
        system_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 5. Notification preferences index'leri
    CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

    -- 6. Notification preferences RLS
    ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own notification preferences" ON notification_preferences
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own notification preferences" ON notification_preferences
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- 7. Fonksiyonlar oluşturma

    -- Bildirim oluşturma fonksiyonu
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

    -- Bildirim okundu olarak işaretleme fonksiyonu
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

    -- Tüm bildirimleri okundu olarak işaretleme
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

    -- Okunmamış bildirim sayısını alma
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

    -- 8. Trigger fonksiyonu - yeni kullanıcı kaydolduğunda notification preferences oluştur
    CREATE OR REPLACE FUNCTION create_user_notification_preferences()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        INSERT INTO notification_preferences (user_id)
        VALUES (NEW.id);
        RETURN NEW;
    END;
    $$;

    -- 9. Trigger oluşturma
    CREATE TRIGGER trigger_create_user_notification_preferences
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION create_user_notification_preferences();

    -- 10. Mevcut kullanıcılar için notification preferences oluşturma
    INSERT INTO notification_preferences (user_id)
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM notification_preferences)
    ON CONFLICT (user_id) DO NOTHING;

    -- 11. View oluşturma - kullanıcılar için bildirim özeti
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

    -- 12. Test verisi (opsiyonel)
    -- INSERT INTO notifications (user_id, type, title, message, data)
    -- VALUES 
    --     ('YOUR_USER_ID_HERE', 'system', 'Hoş Geldiniz!', 'Bildirim sistemine hoş geldiniz!', '{"welcome": true}'),
    --     ('YOUR_USER_ID_HERE', 'comment', 'Yeni Yorum', 'Başlığınıza yeni bir yorum yapıldı', '{"topic_id": "test", "comment_id": "test"}');

    COMMENT ON TABLE notifications IS 'Kullanıcı bildirimleri tablosu';
    COMMENT ON TABLE notification_preferences IS 'Kullanıcı bildirim tercihleri tablosu';
    COMMENT ON FUNCTION create_notification IS 'Yeni bildirim oluşturma fonksiyonu';
    COMMENT ON FUNCTION mark_notification_as_read IS 'Bildirimi okundu olarak işaretleme';
    COMMENT ON FUNCTION mark_all_notifications_as_read IS 'Tüm bildirimleri okundu olarak işaretleme';
    COMMENT ON FUNCTION get_unread_notification_count IS 'Okunmamış bildirim sayısını alma';
