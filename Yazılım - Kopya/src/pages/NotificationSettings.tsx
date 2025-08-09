import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationService } from '../lib/notifications';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import NotificationSettingsForm from '../components/NotificationSettingsForm';

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { requestNotificationPermission } = useNotifications();
  const toast = useToast();
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    browser_notifications: true,
    desktop_notifications: true,
    comment_notifications: true,
    like_notifications: true,
    mention_notifications: true,
    follow_notifications: true,
    system_notifications: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (user) {
      loadPreferences();
      checkBrowserPermission();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await NotificationService.getPreferences();
      if (prefs) {
        setPreferences({
          email_notifications: prefs.email_notifications,
          browser_notifications: prefs.browser_notifications,
          desktop_notifications: prefs.desktop_notifications,
          comment_notifications: prefs.comment_notifications,
          like_notifications: prefs.like_notifications,
          mention_notifications: prefs.mention_notifications,
          follow_notifications: prefs.follow_notifications,
          system_notifications: prefs.system_notifications
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.showError('Hata', 'Bildirim tercihleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await NotificationService.updatePreferences(preferences);
      toast.showSuccess('Başarılı', 'Bildirim tercihleri kaydedildi');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.showError('Hata', 'Bildirim tercihleri kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestBrowserPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setBrowserPermission('granted');
        setPreferences(prev => ({ ...prev, browser_notifications: true }));
      } else {
        setBrowserPermission('denied');
        setPreferences(prev => ({ ...prev, browser_notifications: false }));
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Giriş Yapmanız Gerekiyor
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Bildirim ayarlarını yönetmek için giriş yapın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Bildirim Ayarları
              </h1>
              <Link
                to="/notifications"
              className="btn-primary"
              >
                Bildirimleri Görüntüle
              </Link>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Bildirim tercihlerinizi yönetin ve hangi tür bildirimleri almak istediğinizi seçin.
            </p>
          </div>

            {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Yükleniyor...</p>
            </div>
              </div>
            ) : (
          <NotificationSettingsForm
            preferences={preferences}
            browserPermission={browserPermission}
            onPreferenceChange={handlePreferenceChange}
            onRequestBrowserPermission={handleRequestBrowserPermission}
            onSave={handleSavePreferences}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
