import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  checkAdminRole,
  checkModeratorRole,
  getDashboardStats,
  getRecentAdminActions,
  getPendingReports,
  getSystemSettings,
  updateSystemSetting,
  getUserRoles,
  assignUserRole,
  removeUserRole,
  updateReportStatus,
  createModerationAction,
  searchUsers,
  getTopUsers,
  getTopCategories,
  AdminDashboardStats,
  AdminAction,
  UserReport,
  SystemSetting,
  UserRole
} from '../lib/admin';

export const useAdmin = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [recentActions, setRecentActions] = useState<AdminAction[]>([]);
  const [pendingReports, setPendingReports] = useState<UserReport[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);

  // Admin yetki kontrolü
  const checkPermissions = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    try {
      const [adminCheck, moderatorCheck] = await Promise.all([
        checkAdminRole(),
        checkModeratorRole()
      ]);

      setIsAdmin(adminCheck);
      setIsModerator(moderatorCheck);
    } catch (error) {
      console.error('Permission check error:', error);
      setIsAdmin(false);
      setIsModerator(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Dashboard istatistikleri
  const loadDashboardStats = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Load dashboard stats error:', error);
      toast.showError('Hata', 'Dashboard istatistikleri yüklenemedi.');
    }
  }, [isAdmin, isModerator, toast]);

  // Son admin aktiviteleri
  const loadRecentActions = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const actions = await getRecentAdminActions(20);
      setRecentActions(actions);
    } catch (error) {
      console.error('Load recent actions error:', error);
      toast.showError('Hata', 'Son aktiviteler yüklenemedi.');
    }
  }, [isAdmin, isModerator, toast]);

  // Bekleyen raporlar
  const loadPendingReports = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const reports = await getPendingReports();
      setPendingReports(reports);
    } catch (error) {
      console.error('Load pending reports error:', error);
      toast.showError('Hata', 'Bekleyen raporlar yüklenemedi.');
    }
  }, [isAdmin, isModerator, toast]);

  // Sistem ayarları
  const loadSystemSettings = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const settings = await getSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error('Load system settings error:', error);
      toast.showError('Hata', 'Sistem ayarları yüklenemedi.');
    }
  }, [isAdmin, toast]);

  // Kullanıcı rolleri
  const loadUserRoles = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const roles = await getUserRoles();
      setUserRoles(roles);
    } catch (error) {
      console.error('Load user roles error:', error);
      toast.showError('Hata', 'Kullanıcı rolleri yüklenemedi.');
    }
  }, [isAdmin, toast]);

  // En iyi kullanıcılar
  const loadTopUsers = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const users = await getTopUsers(10);
      setTopUsers(users);
    } catch (error) {
      console.error('Load top users error:', error);
      toast.showError('Hata', 'En iyi kullanıcılar yüklenemedi.');
    }
  }, [isAdmin, isModerator, toast]);

  // En iyi kategoriler
  const loadTopCategories = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    try {
      const categories = await getTopCategories(10);
      setTopCategories(categories);
    } catch (error) {
      console.error('Load top categories error:', error);
      toast.showError('Hata', 'En iyi kategoriler yüklenemedi.');
    }
  }, [isAdmin, isModerator, toast]);

  // Sistem ayarı güncelleme
  const updateSetting = useCallback(async (settingKey: string, settingValue: string) => {
    if (!isAdmin) return false;

    try {
      const success = await updateSystemSetting(settingKey, settingValue);
      if (success) {
        toast.showSuccess('Başarılı', 'Sistem ayarı güncellendi.');
        await loadSystemSettings(); // Ayarları yeniden yükle
        return true;
      } else {
        toast.showError('Hata', 'Sistem ayarı güncellenemedi.');
        return false;
      }
    } catch (error) {
      console.error('Update setting error:', error);
      toast.showError('Hata', 'Sistem ayarı güncellenirken hata oluştu.');
      return false;
    }
  }, [isAdmin, toast, loadSystemSettings]);

  // Kullanıcı rolü atama
  const assignRole = useCallback(async (userId: string, role: 'admin' | 'moderator' | 'user', expiresAt?: string) => {
    if (!isAdmin) return false;

    try {
      const success = await assignUserRole(userId, role, expiresAt);
      if (success) {
        toast.showSuccess('Başarılı', `Kullanıcıya ${role} rolü atandı.`);
        await loadUserRoles(); // Rolleri yeniden yükle
        return true;
      } else {
        toast.showError('Hata', 'Rol atanamadı.');
        return false;
      }
    } catch (error) {
      console.error('Assign role error:', error);
      toast.showError('Hata', 'Rol atanırken hata oluştu.');
      return false;
    }
  }, [isAdmin, toast, loadUserRoles]);

  // Kullanıcı rolü kaldırma
  const removeRole = useCallback(async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    if (!isAdmin) return false;

    try {
      const success = await removeUserRole(userId, role);
      if (success) {
        toast.showSuccess('Başarılı', `Kullanıcıdan ${role} rolü kaldırıldı.`);
        await loadUserRoles(); // Rolleri yeniden yükle
        return true;
      } else {
        toast.showError('Hata', 'Rol kaldırılamadı.');
        return false;
      }
    } catch (error) {
      console.error('Remove role error:', error);
      toast.showError('Hata', 'Rol kaldırılırken hata oluştu.');
      return false;
    }
  }, [isAdmin, toast, loadUserRoles]);

  // Rapor durumu güncelleme
  const updateReport = useCallback(async (reportId: string, status: 'resolved' | 'dismissed', adminNotes?: string) => {
    if (!isAdmin && !isModerator) return false;

    try {
      const success = await updateReportStatus(reportId, status, adminNotes);
      if (success) {
        toast.showSuccess('Başarılı', 'Rapor durumu güncellendi.');
        await loadPendingReports(); // Raporları yeniden yükle
        return true;
      } else {
        toast.showError('Hata', 'Rapor durumu güncellenemedi.');
        return false;
      }
    } catch (error) {
      console.error('Update report error:', error);
      toast.showError('Hata', 'Rapor güncellenirken hata oluştu.');
      return false;
    }
  }, [isAdmin, isModerator, toast, loadPendingReports]);

  // Moderation action oluşturma
  const createModeration = useCallback(async (
    targetType: 'user' | 'topic' | 'comment',
    targetId: string,
    actionType: 'warn' | 'suspend' | 'ban' | 'delete' | 'hide',
    reason?: string,
    durationHours?: number
  ) => {
    if (!isAdmin && !isModerator) return false;

    try {
      const success = await createModerationAction(targetType, targetId, actionType, reason, durationHours);
      if (success) {
        toast.showSuccess('Başarılı', 'Moderation action oluşturuldu.');
        await loadRecentActions(); // Aktiviteleri yeniden yükle
        return true;
      } else {
        toast.showError('Hata', 'Moderation action oluşturulamadı.');
        return false;
      }
    } catch (error) {
      console.error('Create moderation error:', error);
      toast.showError('Hata', 'Moderation action oluşturulurken hata oluştu.');
      return false;
    }
  }, [isAdmin, isModerator, toast, loadRecentActions]);

  // Kullanıcı arama
  const searchUsersByQuery = useCallback(async (query: string) => {
    if (!isAdmin && !isModerator) return [];

    try {
      const users = await searchUsers(query);
      return users;
    } catch (error) {
      console.error('Search users error:', error);
      toast.showError('Hata', 'Kullanıcı arama hatası.');
      return [];
    }
  }, [isAdmin, isModerator, toast]);

  // Tüm verileri yükle
  const loadAllData = useCallback(async () => {
    if (!isAdmin && !isModerator) return;

    await Promise.all([
      loadDashboardStats(),
      loadRecentActions(),
      loadPendingReports(),
      loadTopUsers(),
      loadTopCategories()
    ]);

    if (isAdmin) {
      await Promise.all([
        loadSystemSettings(),
        loadUserRoles()
      ]);
    }
  }, [isAdmin, isModerator, loadDashboardStats, loadRecentActions, loadPendingReports, loadSystemSettings, loadUserRoles, loadTopUsers, loadTopCategories]);

  // İlk yükleme
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Yetki değiştiğinde verileri yükle
  useEffect(() => {
    if (isAdmin || isModerator) {
      loadAllData();
    }
  }, [isAdmin, isModerator, loadAllData]);

  return {
    // State
    isAdmin,
    isModerator,
    loading,
    dashboardStats,
    recentActions,
    pendingReports,
    systemSettings,
    userRoles,
    topUsers,
    topCategories,

    // Actions
    checkPermissions,
    loadDashboardStats,
    loadRecentActions,
    loadPendingReports,
    loadSystemSettings,
    loadUserRoles,
    loadTopUsers,
    loadTopCategories,
    updateSetting,
    assignRole,
    removeRole,
    updateReport,
    createModeration,
    searchUsersByQuery,
    loadAllData
  };
}; 