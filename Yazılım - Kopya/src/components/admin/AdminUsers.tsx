import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { formatDate } from '../../lib/supabase';

const AdminUsers: React.FC = () => {
  const { userRoles, searchUsersByQuery, assignRole, removeRole, isAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  // Kullanıcı arama
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsersByQuery(searchQuery);
      console.log('Search results:', results);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchUsersByQuery]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  // Rol atama
  const handleAssignRole = async () => {
    if (!selectedUser || !isAdmin) return;

    const success = await assignRole(selectedUser.id, selectedRole, expiresAt || undefined);
    if (success) {
      setSelectedUser(null);
      setSelectedRole('user');
      setExpiresAt('');
    }
  };

  // Rol kaldırma
  const handleRemoveRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    if (!isAdmin) return;

    const success = await removeRole(userId, role);
    if (success) {
      // Kullanıcı listesini yenile
      window.location.reload();
    }
  };

  // Arama sonuçlarındaki kullanıcının rollerini al
  const getSearchUserRoles = (user: any) => {
    if (user.user_roles && Array.isArray(user.user_roles)) {
      return user.user_roles.filter((role: any) => role.is_active);
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">👥 Kullanıcı Yönetimi</h2>
        <p className="text-slate-600 dark:text-slate-400">Kullanıcıları arayın ve rollerini yönetin</p>
      </div>

      {/* Kullanıcı Arama */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Kullanıcı adı veya email ile arayın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Arama Sonuçları */}
      {searchQuery.trim() && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Arama Sonuçları</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
              <p className="text-slate-600 dark:text-slate-400">🔍 Aranıyor...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <div key={user.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user?.username || 'Kullanıcı'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (user?.username || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{user?.username || 'Anonim Kullanıcı'}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email || 'E-posta yok'}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Katılım: {formatDate(user?.created_at || new Date().toISOString())}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mevcut Roller:</h5>
                    {getSearchUserRoles(user).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {getSearchUserRoles(user).map((role: any, index: number) => (
                          <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${
                            role.role === 'admin' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : role.role === 'moderator'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {role.role === 'admin' ? '👑 Admin' : 
                             role.role === 'moderator' ? '🛡️ Moderator' : '👤 User'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">Rol atanmamış</span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Rol Ata
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Sonuç bulunamadı</div>
          )}
        </div>
      )}

      {/* Tüm Kullanıcılar */}
      <div className="all-users-section">
        <h3>Tüm Kullanıcılar ({userRoles.length})</h3>
        <div className="users-table">
          <div className="table-header">
            <div className="header-cell">Kullanıcı</div>
            <div className="header-cell">Roller</div>
            <div className="header-cell">Atanma Tarihi</div>
            {isAdmin && <div className="header-cell">İşlemler</div>}
          </div>

          {userRoles.map((userRole) => (
            <div key={userRole.id} className="table-row">
              <div className="table-cell user-cell">
                <div className="user-avatar-small">
                  {userRole.profiles?.avatar_url ? (
                    <img src={userRole.profiles.avatar_url} alt={userRole.profiles?.username || 'Kullanıcı'} />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {(userRole.profiles?.username || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h4>{userRole.profiles?.username || 'Anonim Kullanıcı'}</h4>
                  <p>{userRole.profiles?.email || 'E-posta yok'}</p>
                </div>
              </div>

              <div className="table-cell">
                <span className={`role-badge ${userRole.role}`}>
                  {userRole.role === 'admin' ? '👑 Admin' : 
                   userRole.role === 'moderator' ? '🛡️ Moderator' : '👤 User'}
                </span>
              </div>

              <div className="table-cell">
                <span>{formatDate(userRole.granted_at)}</span>
                {userRole.expires_at && (
                  <span className="expires-at">
                    Bitiş: {formatDate(userRole.expires_at)}
                  </span>
                )}
              </div>

              {isAdmin && (
                <div className="table-cell">
                  <button
                    onClick={() => handleRemoveRole(userRole.user_id, userRole.role)}
                    className="remove-btn"
                    title="Rolü kaldır"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rol Atama Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rol Ata: {selectedUser?.username || 'Anonim Kullanıcı'}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Rol:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="role-select"
                >
                  <option value="user">👤 User</option>
                  <option value="moderator">🛡️ Moderator</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bitiş Tarihi (Opsiyonel):</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedUser(null)}
                className="cancel-btn"
              >
                İptal
              </button>
              <button
                onClick={handleAssignRole}
                className="confirm-btn"
              >
                Rol Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 