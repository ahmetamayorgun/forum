import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { formatDate } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const {
    dashboardStats,
    recentActions,
    topUsers,
    topCategories,
    loading
  } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_users || 0}</p>
              <p className="text-blue-100 text-sm">
                +{dashboardStats?.new_users_today || 0} bugün
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Toplam Başlık</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_topics || 0}</p>
              <p className="text-green-100 text-sm">
                +{dashboardStats?.topics_today || 0} bugün
              </p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Toplam Yorum</p>
              <p className="text-3xl font-bold">{dashboardStats?.total_comments || 0}</p>
              <p className="text-purple-100 text-sm">
                +{dashboardStats?.comments_today || 0} bugün
              </p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Bekleyen Rapor</p>
              <p className="text-3xl font-bold">{dashboardStats?.pending_reports || 0}</p>
              <p className="text-red-100 text-sm">İncelenmeyi bekliyor</p>
            </div>
            <div className="text-4xl">🚨</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* En İyi Kullanıcılar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">🏆 En İyi Kullanıcılar</h2>
          <div className="space-y-4">
            {topUsers.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user?.username || 'Kullanıcı'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user?.username || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{user?.username || 'Anonim Kullanıcı'}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{user?.user_points?.points || 0} puan</p>
                </div>
                <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                  <div>{user.user_points?.total_topics || 0} başlık</div>
                  <div>{user.user_points?.total_comments || 0} yorum</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En Popüler Kategoriler */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">📂 En Popüler Kategoriler</h2>
          <div className="space-y-4">
            {topCategories.slice(0, 5).map((category, index) => (
              <div key={category.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                <div className="text-2xl">{category.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{category.topic_count} başlık</p>
                </div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Son Admin Aktiviteleri */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">📋 Son Admin Aktiviteleri</h2>
        <div className="space-y-4">
          {recentActions.slice(0, 10).map((action) => (
            <div key={action.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="text-2xl">{getActionIcon(action.action_type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{getActionTitle(action.action_type)}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{action.admin_username}</p>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(action.created_at)}
                </span>
              </div>
              {action.details && (
                <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                  {JSON.stringify(action.details)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Yardımcı fonksiyonlar
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
    'user_suspended': '⏸️'
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
    'user_suspended': 'Kullanıcı Askıya Alındı'
  };
  return titles[actionType] || 'Bilinmeyen Eylem';
};

export default AdminDashboard; 