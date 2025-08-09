import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { formatDate } from '../../lib/supabase';

const AdminLogs: React.FC = () => {
  const { recentActions } = useAdmin();

  const getActionIcon = (actionType: string): string => {
    const icons: { [key: string]: string } = {
      'user_role_assigned': '👤',
      'user_role_removed': '🚫',
      'report_resolved': '✅',
      'report_dismissed': '❌',
      'moderation_action': '🛡️',
      'system_setting_updated': '⚙️',
      'topic_deleted': '🗑️',
      'comment_deleted': '🗑️',
      'user_banned': '🚫',
      'user_suspended': '⏸️',
      'first_admin_created': '👑',
      'update_system_setting': '⚙️',
      'assign_user_role': '👤',
      'remove_user_role': '🚫',
      'update_report_status': '📋',
      'create_moderation_action': '🛡️'
    };
    return icons[actionType] || '📝';
  };

  const getActionTitle = (actionType: string): string => {
    const titles: { [key: string]: string } = {
      'user_role_assigned': 'Kullanıcı Rolü Atandı',
      'user_role_removed': 'Kullanıcı Rolü Kaldırıldı',
      'report_resolved': 'Rapor Çözüldü',
      'report_dismissed': 'Rapor Reddedildi',
      'moderation_action': 'Moderation Eylemi',
      'system_setting_updated': 'Sistem Ayarı Güncellendi',
      'topic_deleted': 'Başlık Silindi',
      'comment_deleted': 'Yorum Silindi',
      'user_banned': 'Kullanıcı Yasaklandı',
      'user_suspended': 'Kullanıcı Askıya Alındı',
      'first_admin_created': 'İlk Admin Oluşturuldu',
      'update_system_setting': 'Sistem Ayarı Güncellendi',
      'assign_user_role': 'Kullanıcı Rolü Atandı',
      'remove_user_role': 'Kullanıcı Rolü Kaldırıldı',
      'update_report_status': 'Rapor Durumu Güncellendi',
      'create_moderation_action': 'Moderation Eylemi Oluşturuldu'
    };
    return titles[actionType] || 'Bilinmeyen Eylem';
  };

  const getActionColor = (actionType: string): string => {
    const colors: { [key: string]: string } = {
      'user_role_assigned': '#10b981',
      'user_role_removed': '#ef4444',
      'report_resolved': '#10b981',
      'report_dismissed': '#f59e0b',
      'moderation_action': '#3b82f6',
      'system_setting_updated': '#8b5cf6',
      'topic_deleted': '#ef4444',
      'comment_deleted': '#ef4444',
      'user_banned': '#ef4444',
      'user_suspended': '#f59e0b',
      'first_admin_created': '#10b981',
      'update_system_setting': '#8b5cf6',
      'assign_user_role': '#10b981',
      'remove_user_role': '#ef4444',
      'update_report_status': '#3b82f6',
      'create_moderation_action': '#3b82f6'
    };
    return colors[actionType] || '#64748b';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">📋 Admin Logları</h2>
        <p className="text-slate-600 dark:text-slate-400">Son admin aktivitelerini görüntüleyin</p>
      </div>

      <div>
        {recentActions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Henüz Log Yok</h3>
            <p className="text-slate-600 dark:text-slate-400">Admin aktiviteleri burada görüntülenecek.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: getActionColor(action.action_type) }}>
                    {getActionIcon(action.action_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{getActionTitle(action.action_type)}</h4>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(action.created_at)}</span>
                    </div>
                  
                    <div className="log-details">
                      <div className="admin-info">
                        <strong>Admin:</strong> {action.admin_username}
                      </div>
                      
                      {action.target_type && action.target_id && (
                        <div className="target-info">
                          <strong>Hedef:</strong> {action.target_type} (ID: {action.target_id.slice(0, 8)}...)
                        </div>
                      )}
                      
                      {action.details && (
                        <div className="action-details">
                          <strong>Detaylar:</strong>
                          <pre>{JSON.stringify(action.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs; 