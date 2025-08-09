import { supabase } from './supabase';

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'like' | 'mention' | 'follow' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
  email_sent: boolean;
  email_sent_at: string | null;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  desktop_notifications: boolean;
  comment_notifications: boolean;
  like_notifications: boolean;
  mention_notifications: boolean;
  follow_notifications: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSummary {
  user_id: string;
  total_notifications: number;
  unread_count: number;
  comment_count: number;
  like_count: number;
  mention_count: number;
  follow_count: number;
  system_count: number;
  latest_notification: string | null;
}

// Notification service class
export class NotificationService {
  // Bildirimleri alma
  static async getNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    try {
      console.log('Fetching notifications...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Notifications fetched successfully:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Exception in getNotifications:', err);
      throw err;
    }
  }

  // Okunmamış bildirim sayısını alma
  static async getUnreadCount(): Promise<number> {
    try {
      console.log('Fetching unread count...');
      
      // Önce RPC fonksiyonunu dene
      const { data, error } = await supabase
        .rpc('get_unread_notification_count');

      if (error) {
        console.warn('RPC function failed, trying direct query:', error.message);
        
        // RPC fonksiyonu yoksa direkt sorgu yap
        const { count: directCount, error: directError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .is('read_at', null);

        if (directError) {
          console.error('Direct query also failed:', directError);
          throw directError;
        }

        console.log('Unread count fetched via direct query:', directCount);
        return directCount || 0;
      }

      console.log('Unread count fetched successfully via RPC:', data);
      return data || 0;
    } catch (err) {
      console.error('Exception in getUnreadCount:', err);
      throw err;
    }
  }

  // Bildirim özetini alma
  static async getNotificationSummary(): Promise<NotificationSummary | null> {
    try {
      console.log('Fetching notification summary...');
      
      // Önce view'ı dene
      const { data, error } = await supabase
        .from('user_notification_summary')
        .select('*')
        .single();

      if (error) {
        console.warn('View query failed, trying manual aggregation:', error.message);
        
        // View yoksa manuel olarak hesapla
        const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('*');

        if (notificationsError) {
          console.error('Failed to fetch notifications for summary:', notificationsError);
          throw notificationsError;
        }

        if (!notifications || notifications.length === 0) {
          return null;
        }

        const summary: NotificationSummary = {
          user_id: notifications[0].user_id,
          total_notifications: notifications.length,
          unread_count: notifications.filter(n => !n.read_at).length,
          comment_count: notifications.filter(n => n.type === 'comment').length,
          like_count: notifications.filter(n => n.type === 'like').length,
          mention_count: notifications.filter(n => n.type === 'mention').length,
          follow_count: notifications.filter(n => n.type === 'follow').length,
          system_count: notifications.filter(n => n.type === 'system').length,
          latest_notification: notifications.reduce((latest, current) => 
            current.created_at > latest.created_at ? current : latest
          ).created_at
        };

        console.log('Notification summary calculated manually:', summary);
        return summary;
      }

      console.log('Notification summary fetched successfully via view:', data);
      return data;
    } catch (err) {
      console.error('Exception in getNotificationSummary:', err);
      throw err;
    }
  }

  // Bildirimi okundu olarak işaretleme
  static async markAsRead(notificationId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('mark_notification_as_read', { p_notification_id: notificationId });

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }

    return data;
  }

  // Tüm bildirimleri okundu olarak işaretleme
  static async markAllAsRead(): Promise<number> {
    const { data, error } = await supabase
      .rpc('mark_all_notifications_as_read');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }

    return data || 0;
  }

  // Email gönderildi olarak işaretleme
  static async markEmailAsSent(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking email as sent:', error);
      throw error;
    }
  }

  // Bildirim tercihlerini alma
  static async getPreferences(): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }

    return data;
  }

  // Bildirim tercihlerini güncelleme
  static async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Yeni bildirim oluşturma (admin/sistem kullanımı için)
  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Promise<string> {
    // Kullanıcının bildirim tercihlerini kontrol et
    const preferences = await this.getPreferences();
    if (preferences) {
      const typeKey = `${type}_notifications` as keyof NotificationPreferences;
      if (!preferences[typeKey]) {
        console.log(`Notification type ${type} is disabled for user ${userId}`);
        return '';
      }
    }

    const { data: notificationId, error } = await supabase
      .rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return notificationId;
  }

  // Real-time subscription için
  static subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${(supabase.auth.getUser() as any)?.data?.user?.id}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }

  // Bildirim türüne göre icon ve renk
  static getNotificationIcon(type: Notification['type']): { icon: string; color: string } {
    switch (type) {
      case 'comment':
        return { icon: '💬', color: 'text-blue-600' };
      case 'like':
        return { icon: '❤️', color: 'text-red-600' };
      case 'mention':
        return { icon: '👤', color: 'text-purple-600' };
      case 'follow':
        return { icon: '👥', color: 'text-green-600' };
      case 'system':
        return { icon: '🔔', color: 'text-orange-600' };
      default:
        return { icon: '📢', color: 'text-gray-600' };
    }
  }

  // Bildirimleri gruplandırma
  static groupNotifications(notifications: Notification[]): {
    today: Notification[];
    yesterday: Notification[];
    thisWeek: Notification[];
    thisMonth: Notification[];
    older: Notification[];
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const groups = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      thisWeek: [] as Notification[],
      thisMonth: [] as Notification[],
      older: [] as Notification[]
    };

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.created_at);
      const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());

      if (notificationDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDate >= thisWeek) {
        groups.thisWeek.push(notification);
      } else if (notificationDate >= thisMonth) {
        groups.thisMonth.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }

  // Grup başlığı oluşturma
  static getGroupTitle(group: keyof ReturnType<typeof NotificationService.groupNotifications>): string {
    switch (group) {
      case 'today':
        return 'Bugün';
      case 'yesterday':
        return 'Dün';
      case 'thisWeek':
        return 'Bu Hafta';
      case 'thisMonth':
        return 'Bu Ay';
      case 'older':
        return 'Daha Eski';
      default:
        return '';
    }
  }

  // Bildirim türüne göre Türkçe açıklama
  static getNotificationTypeLabel(type: Notification['type']): string {
    switch (type) {
      case 'comment':
        return '💬 Yorum';
      case 'like':
        return '❤️ Beğeni';
      case 'mention':
        return '👤 Etiketleme';
      case 'follow':
        return '👥 Takip';
      case 'system':
        return '🔔 Sistem';
      default:
        return '📢 Bildirim';
    }
  }

  // Zaman formatı
  static formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} sa önce`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Browser notification helper
export class BrowserNotificationHelper {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim desteği sunmuyor');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      ...options
    };

    new Notification(title, defaultOptions);
  }

  static async showNotificationSound(): Promise<void> {
    try {
      // Ses dosyası yoksa tarayıcının varsayılan sesini kullan
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else {
        // Fallback: Basit bir beep sesi
        console.log('🔔 Bildirim sesi çalındı');
      }
    } catch (error) {
      console.warn('Bildirim sesi çalınamadı:', error);
    }
  }
}

// Notification utility functions
export const createCommentNotification = async (
  topicOwnerId: string,
  commenterUsername: string,
  topicTitle: string,
  topicId: string,
  commentId: string
) => {
  return NotificationService.createNotification(
    topicOwnerId,
    'comment',
    '💬 Yorum',
    `@${commenterUsername} başlığınıza yorum yazdı`,
    { topic_id: topicId, comment_id: commentId, commenter_username: commenterUsername, topic_title: topicTitle }
  );
};

export const createLikeNotification = async (
  contentOwnerId: string,
  likerUsername: string,
  contentType: 'topic' | 'comment',
  contentTitle: string,
  contentId: string
) => {
  const contentTypeText = contentType === 'topic' ? 'başlığınızı' : 'yorumunuzu';
  return NotificationService.createNotification(
    contentOwnerId,
    'like',
    '❤️ Beğeni',
    `@${likerUsername} ${contentTypeText} beğendi`,
    { content_type: contentType, content_id: contentId, liker_username: likerUsername, content_title: contentTitle }
  );
};

export const createMentionNotification = async (
  mentionedUserId: string,
  mentionerUsername: string,
  content: string,
  topicId: string,
  commentId?: string
) => {
  return NotificationService.createNotification(
    mentionedUserId,
    'mention',
    '👤 Etiketlendiniz',
    `@${mentionerUsername} sizi etiketledi`,
    { topic_id: topicId, comment_id: commentId, mentioner_username: mentionerUsername, content: content.substring(0, 100) }
  );
};

export const createFollowNotification = async (
  followedUserId: string,
  followerUsername: string
) => {
  return NotificationService.createNotification(
    followedUserId,
    'follow',
    '👥 Takipçi',
    `@${followerUsername} sizi takip etti`,
    { follower_username: followerUsername }
  );
};

export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  data: Record<string, any> = {}
) => {
  return NotificationService.createNotification(
    userId,
    'system',
    title,
    message,
    data
  );
};

// Email bildirimleri için yardımcı fonksiyonlar
export const sendEmailNotification = async (
  userId: string,
  email: string,
  subject: string,
  content: string
): Promise<boolean> => {
  try {
    // Bu fonksiyon email gönderme servisi ile entegre edilecek
    // Örnek: SendGrid, Mailgun, AWS SES vb.
    console.log('Email notification would be sent:', {
      userId,
      email,
      subject,
      content
    });
    
    // Email gönderildi olarak işaretle
    await NotificationService.markEmailAsSent(userId);
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Email gönderildi olarak işaretleme
export const markEmailAsSent = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({
      email_sent: true,
      email_sent_at: new Date().toISOString()
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking email as sent:', error);
    throw error;
  }
};
