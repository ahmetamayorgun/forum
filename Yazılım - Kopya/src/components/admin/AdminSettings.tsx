import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';

const AdminSettings: React.FC = () => {
  const { systemSettings, updateSetting } = useAdmin();
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (setting: any) => {
    setEditingSetting(setting.setting_key);
    setEditValue(setting.setting_value);
  };

  const handleSave = async () => {
    if (!editingSetting) return;

    const success = await updateSetting(editingSetting, editValue);
    if (success) {
      setEditingSetting(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingSetting(null);
    setEditValue('');
  };

  const getSettingIcon = (key: string) => {
    const icons: { [key: string]: string } = {
      'site_name': '🏠',
      'site_description': '📝',
      'max_topics_per_day': '📊',
      'max_comments_per_day': '💬',
      'auto_approve_topics': '✅',
      'auto_approve_comments': '✅',
      'maintenance_mode': '🔧',
      'registration_enabled': '📝',
      'guest_viewing_enabled': '👁️'
    };
    return icons[key] || '⚙️';
  };

  const getSettingType = (setting: any) => {
    switch (setting.setting_type) {
      case 'boolean':
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="true">Açık</option>
            <option value="false">Kapalı</option>
          </select>
        );
      case 'integer':
        return (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        );
      default:
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">⚙️ Sistem Ayarları</h2>
        <p className="text-slate-600 dark:text-slate-400">Sistem genelinde ayarları yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemSettings.map((setting) => (
          <div key={setting.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-2xl">
                {getSettingIcon(setting.setting_key)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {setting.setting_key.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {editingSetting === setting.setting_key ? (
                <div className="space-y-3">
                  {getSettingType(setting)}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      💾 Kaydet
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      ❌ İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                    {setting.setting_type === 'boolean' 
                      ? (setting.setting_value === 'true' ? 'Açık' : 'Kapalı')
                      : setting.setting_value
                    }
                  </span>
                  <button
                    onClick={() => handleEdit(setting)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {setting.setting_type}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                setting.is_public 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {setting.is_public ? '🌍 Genel' : '🔒 Özel'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings; 