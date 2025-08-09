import { supabase } from './supabase';

// Admin sistemi için TypeScript tipleri
export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  profiles?: {
    username: string;
    email: string;
    avatar_url?: string;
  };
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_type?: string;
  target_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_username?: string;
  admin_avatar?: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'integer' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  updated_by?: string;
  updated_at: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_topic_id?: string;
  reported_comment_id?: string;
  report_type: 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  reporter_username?: string;
  reported_username?: string;
  topic_title?: string;
  comment_content?: string;
}

export interface ModerationAction {
  id: string;
  moderator_id: string;
  target_type: 'user' | 'topic' | 'comment';
  target_id: string;
  action_type: 'warn' | 'suspend' | 'ban' | 'delete' | 'hide';
  reason?: string;
  duration_hours?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  total_topics: number;
  total_comments: number;
  pending_reports: number;
  topics_today: number;
  comments_today: number;
  new_users_today: number;
}

// Admin yetki kontrolü
export const checkAdminRole = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Admin role check error:', error);
    return false;
  }
};

export const checkModeratorRole = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_moderator');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Moderator role check error:', error);
    return false;
  }
};

// Admin action log
export const logAdminAction = async (
  actionType: string,
  targetType?: string,
  targetId?: string,
  details?: any
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('log_admin_action', {
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details: details
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Admin action log error:', error);
    return null;
  }
};

// Dashboard istatistikleri
export const getDashboardStats = async (): Promise<AdminDashboardStats | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return null;
  }
};

// Son admin aktiviteleri
export const getRecentAdminActions = async (limit: number = 20): Promise<AdminAction[]> => {
  try {
    const { data, error } = await supabase
      .from('recent_admin_actions')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Recent admin actions error:', error);
    return [];
  }
};

// Bekleyen raporlar
export const getPendingReports = async (): Promise<UserReport[]> => {
  try {
    const { data, error } = await supabase
      .from('pending_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Pending reports error:', error);
    return [];
  }
};

// Sistem ayarları
export const getSystemSettings = async (): Promise<SystemSetting[]> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('System settings error:', error);
    return [];
  }
};

export const updateSystemSetting = async (
  settingKey: string,
  settingValue: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .update({ 
        setting_value: settingValue,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', settingKey);
    
    if (error) throw error;
    
    // Log admin action
    await logAdminAction('update_system_setting', 'setting', settingKey, {
      setting_key: settingKey,
      new_value: settingValue
    });
    
    return true;
  } catch (error) {
    console.error('Update system setting error:', error);
    return false;
  }
};

// Kullanıcı rolleri yönetimi
export const getUserRoles = async (): Promise<UserRole[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles!user_roles_user_id_fkey(username, email, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user roles error:', error);
    return [];
  }
};

export const assignUserRole = async (
  userId: string,
  role: 'admin' | 'moderator' | 'user',
  expiresAt?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role,
        granted_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: expiresAt,
        is_active: true
      });
    
    if (error) throw error;
    
    // Log admin action
    await logAdminAction('assign_user_role', 'user', userId, {
      role,
      expires_at: expiresAt
    });
    
    return true;
  } catch (error) {
    console.error('Assign user role error:', error);
    return false;
  }
};

export const removeUserRole = async (
  userId: string,
  role: 'admin' | 'moderator' | 'user'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
    
    // Log admin action
    await logAdminAction('remove_user_role', 'user', userId, { role });
    
    return true;
  } catch (error) {
    console.error('Remove user role error:', error);
    return false;
  }
};

// Rapor yönetimi
export const updateReportStatus = async (
  reportId: string,
  status: 'resolved' | 'dismissed',
  adminNotes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_reports')
      .update({
        status,
        admin_notes: adminNotes,
        resolved_by: (await supabase.auth.getUser()).data.user?.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', reportId);
    
    if (error) throw error;
    
    // Log admin action
    await logAdminAction('update_report_status', 'report', reportId, {
      status,
      admin_notes: adminNotes
    });
    
    return true;
  } catch (error) {
    console.error('Update report status error:', error);
    return false;
  }
};

// Moderation actions
export const createModerationAction = async (
  targetType: 'user' | 'topic' | 'comment',
  targetId: string,
  actionType: 'warn' | 'suspend' | 'ban' | 'delete' | 'hide',
  reason?: string,
  durationHours?: number
): Promise<boolean> => {
  try {
    const expiresAt = durationHours 
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('moderation_actions')
      .insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        target_type: targetType,
        target_id: targetId,
        action_type: actionType,
        reason,
        duration_hours: durationHours,
        expires_at: expiresAt,
        is_active: true
      });
    
    if (error) throw error;
    
    // Log admin action
    await logAdminAction('create_moderation_action', targetType, targetId, {
      action_type: actionType,
      reason,
      duration_hours: durationHours
    });
    
    return true;
  } catch (error) {
    console.error('Create moderation action error:', error);
    return false;
  }
};

// Kullanıcı arama
export const searchUsers = async (query: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role, is_active)
      `)
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);
    
    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Search users error:', error);
    return [];
  }
};

// İstatistikler
export const getTopUsers = async (limit: number = 10): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_points(points, total_topics, total_comments)
      `)
      .order('user_points.points', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get top users error:', error);
    return [];
  }
};

export const getTopCategories = async (limit: number = 10): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('topic_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get top categories error:', error);
    return [];
  }
}; 