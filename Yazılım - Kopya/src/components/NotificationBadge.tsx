import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationBadge: React.FC = () => {
  const { unreadCount, requestNotificationPermission, loading } = useNotifications();
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sayfa yüklendiğinde bildirim iznini kontrol et
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const handleBadgeClick = async () => {
    if (!hasPermission && !showPermissionRequest) {
      setShowPermissionRequest(true);
      return;
    }

    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      setHasPermission(granted);
      setShowPermissionRequest(false);
    }
  };

  const handlePermissionRequest = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    setShowPermissionRequest(false);
  };

  const handleDismissPermission = () => {
    setShowPermissionRequest(false);
  };

  // Badge animasyonu için CSS class'ları
  const badgeClasses = `
    relative inline-flex items-center justify-center
    w-6 h-6 text-xs font-bold text-white
    bg-red-500 rounded-full
    transition-all duration-300 ease-in-out
    hover:bg-red-600 hover:scale-110
    cursor-pointer
    ${unreadCount > 0 ? 'animate-pulse' : ''}
  `;

  const notificationIconClasses = `
    w-6 h-6 text-slate-600 dark:text-slate-300
    hover:text-red-600 dark:hover:text-red-400
    transition-colors duration-200
    cursor-pointer
  `;

  return (
    <div className="relative" ref={badgeRef}>
      {/* Ana bildirim ikonu */}
      <div 
        className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
        onClick={handleBadgeClick}
      >
        <svg 
          className={notificationIconClasses}
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

        {/* Loading spinner veya okunmamış bildirim sayısı badge'i */}
        {loading ? (
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : unreadCount > 0 ? (
          <div className={badgeClasses}>
            <span className="transform scale-90">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        ) : null}
      </div>

      {/* Bildirim izni isteme popup'ı */}
      {showPermissionRequest && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Bildirim İzni
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Yeni bildirimler geldiğinde tarayıcı bildirimleri almak ister misiniz?
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handlePermissionRequest}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    İzin Ver
                  </button>
                  <button
                    onClick={handleDismissPermission}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Daha Sonra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
