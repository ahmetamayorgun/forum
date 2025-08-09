import React from 'react';

interface NotificationPreferences {
  email_notifications: boolean;
  browser_notifications: boolean;
  desktop_notifications: boolean;
  comment_notifications: boolean;
  like_notifications: boolean;
  mention_notifications: boolean;
  follow_notifications: boolean;
  system_notifications: boolean;
}

interface NotificationSettingsFormProps {
  preferences: NotificationPreferences;
  browserPermission: NotificationPermission;
  onPreferenceChange: (key: string, value: boolean) => void;
  onRequestBrowserPermission: () => void;
  onSave: () => void;
  saving: boolean;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  preferences,
  browserPermission,
  onPreferenceChange,
  onRequestBrowserPermission,
  onSave,
  saving
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Bildirim Ayarları
      </h2>

      {/* Browser Permission Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">
          Tarayıcı Bildirimleri
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div>
            <p className="text-slate-700 dark:text-slate-300">
              Tarayıcı bildirim izni: 
              <span className={`ml-2 font-medium ${
                browserPermission === 'granted' ? 'text-green-600' :
                browserPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {browserPermission === 'granted' ? 'İzin Verildi' :
                 browserPermission === 'denied' ? 'Reddedildi' : 'Beklemede'}
              </span>
            </p>
          </div>
          
          {browserPermission !== 'granted' && (
            <button
              onClick={onRequestBrowserPermission}
              className="btn-primary"
            >
              İzin İste
            </button>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Bildirim Türleri
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Email Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Önemli güncellemeler için email al
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => onPreferenceChange('email_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Tarayıcı Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tarayıcı üzerinden anlık bildirimler
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.browser_notifications}
                onChange={(e) => onPreferenceChange('browser_notifications', e.target.checked)}
                className="sr-only peer"
                disabled={browserPermission !== 'granted'}
              />
              <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 ${browserPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Masaüstü Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Masaüstü uygulaması bildirimleri
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.desktop_notifications}
                onChange={(e) => onPreferenceChange('desktop_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Specific Notifications */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Bildirim Detayları
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Yorum Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Konularınıza yapılan yorumlar
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.comment_notifications}
                onChange={(e) => onPreferenceChange('comment_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Beğeni Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                İçeriklerinize yapılan beğeniler
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.like_notifications}
                onChange={(e) => onPreferenceChange('like_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Etiketleme Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sizi etiketleyen yorumlar
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.mention_notifications}
                onChange={(e) => onPreferenceChange('mention_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Takip Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sizi takip eden kullanıcılar
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.follow_notifications}
                onChange={(e) => onPreferenceChange('follow_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-medium">
                Sistem Bildirimleri
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Önemli sistem güncellemeleri
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.system_notifications}
                onChange={(e) => onPreferenceChange('system_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsForm;
