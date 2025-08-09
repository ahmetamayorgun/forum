import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationService } from '../lib/notifications';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { notifications, loading, error, markAsRead, markAllAsRead, refreshNotifications, clearError } = useNotifications();
  const toast = useToast();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'comment' | 'like' | 'mention' | 'follow' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRead, setShowRead] = useState(true);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    // Filtre kontrolü
    if (filter === 'unread' && notification.read_at) return false;
    if (filter !== 'all' && filter !== 'unread' && notification.type !== filter) return false;
    
    // Arama kontrolü
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Okunmuş/okunmamış kontrolü
    if (!showRead && notification.read_at) return false;
    
    return true;
  });

  const groupedNotifications = NotificationService.groupNotifications(filteredNotifications);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast.showSuccess('Başarılı', 'Bildirim okundu olarak işaretlendi');
    } catch (error) {
      toast.showError('Hata', 'Bildirim işaretlenirken hata oluştu');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.showSuccess('Başarılı', 'Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      toast.showError('Hata', 'Bildirimler işaretlenirken hata oluştu');
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.data?.topic_id) {
      return `/topic/${notification.data.topic_id}`;
    }
    return '#';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Giriş Yapmanız Gerekiyor
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Bildirimleri görüntülemek için giriş yapın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Bildirimler
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading || notifications.filter(n => !n.read_at).length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Tümünü Okundu İşaretle
                </button>
                <Link
                  to="/"
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                  Ana Sayfa
                </Link>
              </div>
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-4 mb-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">Tümü</option>
                <option value="unread">Okunmamış</option>
                <option value="comment">Yorumlar</option>
                <option value="like">Beğeniler</option>
                <option value="mention">Etiketlemeler</option>
                <option value="follow">Takipçiler</option>
                <option value="system">Sistem</option>
              </select>

              <input
                type="text"
                placeholder="Bildirimlerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 flex-1 min-w-64"
              />

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Okunmuş bildirimleri göster</span>
              </label>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  {notifications.length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Toplam</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="font-bold text-red-600 dark:text-red-400">
                  {notifications.filter(n => !n.read_at).length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Okunmamış</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-bold text-green-600 dark:text-green-400">
                  {notifications.filter(n => n.type === 'comment').length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Yorum</div>
              </div>
              <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="font-bold text-pink-600 dark:text-pink-400">
                  {notifications.filter(n => n.type === 'like').length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Beğeni</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="font-bold text-purple-600 dark:text-purple-400">
                  {notifications.filter(n => n.type === 'mention').length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Etiketleme</div>
              </div>
            </div>
          </div>

          {/* Bildirimler Listesi */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400 mb-2">
                  Bildirimler yüklenemedi
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {error}
                </p>
                <button
                  onClick={() => {
                    clearError();
                    refreshNotifications();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 0 0 4 6v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H8a4 4 0 0 0-2.81 1.19zM12 8v4m0 4h.01" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm || filter !== 'all' ? 'Arama kriterlerinize uygun bildirim bulunamadı' : 'Henüz bildiriminiz yok'}
                </p>
                <p className="text-slate-400 dark:text-slate-500 mt-1">
                  Yeni aktiviteler olduğunda burada görünecek
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => {
                  if (groupNotifications.length === 0) return null;
                  
                  return (
                    <div key={groupKey}>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {NotificationService.getGroupTitle(groupKey as any)}
                        </h3>
                        <div className="mt-2 h-px bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                      
                      <div className="space-y-3">
                        {groupNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                              notification.read_at
                                ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                                : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-600 shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="flex-shrink-0">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                    notification.read_at ? 'bg-slate-200 dark:bg-slate-600' : 'bg-blue-100 dark:bg-blue-900/30'
                                  }`}>
                                    {NotificationService.getNotificationIcon(notification.type).icon}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={`font-medium ${
                                      notification.read_at 
                                        ? 'text-slate-700 dark:text-slate-300' 
                                        : 'text-slate-900 dark:text-slate-100'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.read_at && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </div>
                                  
                                  <p className={`text-sm ${
                                    notification.read_at 
                                      ? 'text-slate-600 dark:text-slate-400' 
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span>{NotificationService.formatNotificationTime(notification.created_at)}</span>
                                    <span className="capitalize">{notification.type}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {!notification.read_at && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    Okundu
                                  </button>
                                )}
                                
                                {getNotificationLink(notification) !== '#' && (
                                  <Link
                                    to={getNotificationLink(notification)}
                                    className="px-3 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors duration-200"
                                  >
                                    Görüntüle
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
