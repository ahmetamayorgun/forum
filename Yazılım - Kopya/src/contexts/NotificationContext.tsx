import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  Notification,
  NotificationService,
  BrowserNotificationHelper,
  NotificationSummary
} from '../lib/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  summary: NotificationSummary | null;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  showBrowserNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping notification refresh');
      return;
    }

    console.log('=== NOTIFICATION DEBUG START ===');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('User Object:', user);
    console.log('=== NOTIFICATION DEBUG END ===');

    setLoading(true);
    setError(null);

    try {
      // Her bir çağrıyı ayrı ayrı yap ve hataları yakala
      let notificationsData: Notification[] = [];
      let unreadCountData: number = 0;
      let summaryData: NotificationSummary | null = null;
      
      try {
        notificationsData = await NotificationService.getNotifications(20, 0);
        console.log('Notifications fetched:', notificationsData?.length || 0);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        throw new Error(`Bildirimler alınamadı: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      }
      
      try {
        unreadCountData = await NotificationService.getUnreadCount();
        console.log('Unread count fetched:', unreadCountData);
      } catch (err) {
        console.error('Error fetching unread count:', err);
        throw new Error(`Okunmamış sayısı alınamadı: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      }
      
      try {
        summaryData = await NotificationService.getNotificationSummary();
        console.log('Summary fetched:', summaryData);
      } catch (err) {
        console.error('Error fetching summary:', err);
        // Summary hatası kritik değil, null olarak devam et
        summaryData = null;
      }

      console.log('=== FETCHED DATA ===');
      console.log('Notifications:', notificationsData);
      console.log('Unread Count:', unreadCountData);
      console.log('Summary:', summaryData);
      console.log('=== END FETCHED DATA ===');

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      setSummary(summaryData);
      setIsInitialized(true);
    } catch (error) {
      console.error('=== NOTIFICATION ERROR ===');
      console.error('Error refreshing notifications:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code
      });
      console.error('=== END NOTIFICATION ERROR ===');
      
      const errorMessage = error instanceof Error ? error.message : 'Bildirimler yüklenirken hata oluştu';
      setError(errorMessage);
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await NotificationService.markAsRead(notificationId);
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Okunmamış sayısını güncelle
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Özeti güncelle
      if (summary) {
        setSummary(prev => prev ? {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1)
        } : null);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bildirim işaretlenirken hata oluştu';
      setError(errorMessage);
      toast.showError('Hata', errorMessage);
    }
  }, [summary, toast]);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      const updatedCount = await NotificationService.markAllAsRead();
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      // Özeti güncelle
      if (summary) {
        setSummary(prev => prev ? {
          ...prev,
          unread_count: 0
        } : null);
      }

      if (updatedCount > 0) {
        toast.showSuccess('Başarılı', `${updatedCount} bildirim okundu olarak işaretlendi`);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bildirimler işaretlenirken hata oluştu';
      setError(errorMessage);
      toast.showError('Hata', errorMessage);
    }
  }, [summary, toast]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await BrowserNotificationHelper.requestPermission();
      if (granted) {
        toast.showSuccess('Bildirimler', 'Tarayıcı bildirimleri etkinleştirildi');
      } else {
        toast.showWarning('Bildirimler', 'Tarayıcı bildirimleri reddedildi');
      }
      return granted;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      toast.showError('Hata', 'Bildirim izni alınamadı');
      return false;
    }
  }, [toast]);

  const showBrowserNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    try {
      await BrowserNotificationHelper.showNotification(title, options);
      await BrowserNotificationHelper.showNotificationSound();
    } catch (err) {
      console.error('Error showing browser notification:', err);
    }
  }, []);

  // Real-time subscription kurulumu
  useEffect(() => {
    if (!user || !isInitialized) {
      if (subscription) {
        subscription.unsubscribe();
        setSubscription(null);
      }
      return;
    }

    const setupSubscription = async () => {
      try {
        const sub = NotificationService.subscribeToNotifications((newNotification) => {
          // Yeni bildirim geldiğinde
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Browser notification göster
          showBrowserNotification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: newNotification.id,
            data: newNotification
          });

          // Toast notification göster
          toast.showInfo(
            NotificationService.getNotificationTypeLabel(newNotification.type),
            newNotification.message
          );
        });

        setSubscription(sub);
      } catch (err) {
        console.error('Error setting up notification subscription:', err);
        // Subscription hatası için ayrı toast gösterme, sadece console'a log
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, isInitialized, showBrowserNotification, toast]);

  // İlk yükleme ve kullanıcı değişikliklerinde bildirimleri al
  useEffect(() => {
    if (user) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setSummary(null);
      setIsInitialized(false);
    }
  }, [user, refreshNotifications]);

  // Periyodik olarak okunmamış sayısını güncelle (2 dakikada bir - daha sık güncelleme)
  useEffect(() => {
    if (!user || !isInitialized) return;

    const interval = setInterval(async () => {
      try {
        const count = await NotificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Error updating unread count:', err);
        // Periyodik güncelleme hatası için toast gösterme
      }
    }, 2 * 60 * 1000); // 2 dakika

    return () => clearInterval(interval);
  }, [user, isInitialized]);

  // Sayfa görünürlüğü değiştiğinde bildirimleri güncelle
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isInitialized) {
        refreshNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isInitialized, refreshNotifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    summary,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    clearError,
    requestNotificationPermission,
    showBrowserNotification,
  }), [
    notifications,
    unreadCount,
    summary,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    clearError,
    requestNotificationPermission,
    showBrowserNotification,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
