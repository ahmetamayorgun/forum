import React, { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Admin paneli alt bileşenleri
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminReports from '../components/admin/AdminReports';
import AdminSettings from '../components/admin/AdminSettings';
import AdminLogs from '../components/admin/AdminLogs';

type AdminTab = 'dashboard' | 'users' | 'reports' | 'settings' | 'logs';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isModerator, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Yetki kontrolü
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Erişim Reddedildi</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Admin paneline erişmek için giriş yapmanız gerekiyor.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Yetkisiz Erişim</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Sadece admin ve moderator kullanıcılar bu sayfaya erişebilir.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'users', label: '👥 Kullanıcılar', icon: '👥' },
    { id: 'reports', label: '🚨 Raporlar', icon: '🚨' },
    ...(isAdmin ? [{ id: 'settings', label: '⚙️ Ayarlar', icon: '⚙️' }] : []),
    { id: 'logs', label: '📋 Loglar', icon: '📋' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return isAdmin ? <AdminSettings /> : null;
      case 'logs':
        return <AdminLogs />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              🛡️ Admin Paneli
            </h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {isAdmin ? '👑 Admin' : '🛡️ Moderator'}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {user?.username || 'Anonim Kullanıcı'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => setActiveTab(tab.id as AdminTab)}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 