import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationService } from '../lib/notifications';
import { Link } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading,
    error,
    clearError,
    refreshNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationLink = (notification: any) => {
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'comment':
        return data.topic_id ? `/topic/${data.topic_id}` : '#';
      case 'like':
        return data.content_id ? `/topic/${data.content_id}` : '#';
      case 'mention':
        return data.topic_id ? `/topic/${data.topic_id}` : '#';
      default:
        return '#';
    }
  };

  const renderNotificationItem = (notification: any) => {
    const { icon, color } = NotificationService.getNotificationIcon(notification.type);
    const isUnread = !notification.read_at;
    const link = getNotificationLink(notification);

    return (
      <div
        key={notification.id}
        className={`p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-colors duration-150 ${
          isUnread 
            ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <Link to={link} className="block">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${color}`}>
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  isUnread 
                    ? 'text-slate-900 dark:text-slate-100' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {notification.title}
                </p>
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
              <p className={`text-sm mt-1 ${
                isUnread 
                  ? 'text-slate-700 dark:text-slate-200' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {notification.message}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {NotificationService.formatNotificationTime(notification.created_at)}
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div 
        className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          className="w-6 h-6 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 0 0 4 6v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H8a4 4 0 0 0-2.81 1.19zM12 8v4m0 4h.01" 
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Tümünü okundu işaretle
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  Bildirimler yüklenemedi
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {error}
                </p>
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={() => {
                      clearError();
                      refreshNotifications();
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    Tekrar dene
                  </button>
                  <button
                    onClick={clearError}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200"
                  >
                    Hata mesajını kapat
                  </button>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 0 0 4 6v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H8a4 4 0 0 0-2.81 1.19zM12 8v4m0 4h.01" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Henüz bildiriminiz yok
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Yeni aktiviteler olduğunda burada görünecek
                </p>
              </div>
            ) : (
              <div>
                {(() => {
                  const groups = NotificationService.groupNotifications(notifications.slice(0, 10));
                  const groupKeys: (keyof typeof groups)[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];
                  
                  return groupKeys.map(groupKey => {
                    const groupNotifications = groups[groupKey];
                    if (groupNotifications.length === 0) return null;
                    
                    return (
                      <div key={groupKey}>
                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {NotificationService.getGroupTitle(groupKey)}
                          </h4>
                        </div>
                        {groupNotifications.map(renderNotificationItem)}
                      </div>
                    );
                  });
                })()}
                {notifications.length > 10 && (
                  <div className="p-3 text-center border-t border-slate-100 dark:border-slate-700">
                    <Link 
                      to="/notifications" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Tüm bildirimleri gör ({notifications.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center justify-between">
              <Link 
                to="/notifications" 
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Tüm bildirimler →
              </Link>
              <Link 
                to="/notification-settings" 
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Ayarlar →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
