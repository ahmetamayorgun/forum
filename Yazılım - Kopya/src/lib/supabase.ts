import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://lykmapiqlxylhwvnxghm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a21hcGlxbHh5bGh3dm54Z2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDU5MTMsImV4cCI6MjA2OTYyMTkxM30.ih4h-FERiyjNWTRcSvYDpOqEOnhCUtiSmi0Z5m7oAKI'

// Supabase client oluşturma
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'saticiyiz-forum-auth',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'saticiyiz-forum',
      'Cache-Control': 'no-cache'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
})

// Database types
export interface User {
  id: string
  email: string
  username: string
  created_at: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  marketplace_badges?: MarketplaceBadge[]
  social_links?: SocialLinks
  join_date?: string
  points?: UserPoints
}

export interface UserPoints {
  id: string
  user_id: string
  points: number
  total_topics: number
  total_comments: number
  total_likes_received: number
  created_at: string
  updated_at: string
}

export interface PointsHistory {
  id: string
  user_id: string
  points_earned: number
  points_type: 'topic_created' | 'comment_created' | 'like_received'
  source_id?: string
  source_type?: 'topic' | 'comment'
  created_at: string
}

export interface MemberLevelHistory {
  id: string
  user_id: string
  old_level?: string
  new_level: string
  points_at_change: number
  changed_at: string
}

export interface MarketplaceBadge {
  marketplace: string
  badge_type: string
  earned_at: string
}

export interface SocialLinks {
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  slug: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  topic_count: number
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  title: string
  content: string
  user_id: string
  category_id?: string
  created_at: string
  user: User
  category?: Category
  likes_count?: number
  dislikes_count?: number
  comments_count?: number
  user_like?: 'like' | 'dislike' | null
}

export interface Comment {
  id: string
  content: string
  topic_id: string
  user_id: string
  created_at: string
  user: User
  likes_count?: number
  dislikes_count?: number
  user_like?: 'like' | 'dislike' | null
}

export interface TopicLike {
  id: string
  topic_id: string
  user_id: string
  like_type: 'like' | 'dislike'
  created_at: string
}

export interface CommentLike {
  id: string
  comment_id: string
  user_id: string
  like_type: 'like' | 'dislike'
  created_at: string
}

// Üye kademeleri
export const MEMBER_LEVELS = {
  BRONZE: { name: 'Bronz Üye', icon: '🥉', minPoints: 0, maxPoints: 999, color: '#CD7F32' },
  SILVER: { name: 'Gümüş Üye', icon: '🥈', minPoints: 1000, maxPoints: 1999, color: '#C0C0C0' },
  GOLD: { name: 'Altın Üye', icon: '🥇', minPoints: 2000, maxPoints: 2999, color: '#FFD700' },
  EMERALD: { name: 'Zümrüt Üye', icon: '💎', minPoints: 3000, maxPoints: 3999, color: '#50C878' },
  DIAMOND: { name: 'Elmas Üye', icon: '💠', minPoints: 4000, maxPoints: Infinity, color: '#B9F2FF' }
} as const;

export type MemberLevel = typeof MEMBER_LEVELS[keyof typeof MEMBER_LEVELS];
export type MemberLevelKey = keyof typeof MEMBER_LEVELS;

// Puan sistemi sabitleri
export const POINTS_SYSTEM = {
  TOPIC_CREATED: 100,
  COMMENT_CREATED: 30,
  LIKE_RECEIVED: 10
} as const;

// Pazaryeri rozetleri için sabitler
export const MARKETPLACE_BADGES = {
  amazon: { name: 'Amazon', icon: '🛒', color: '#FF9900' },
  hepsiburada: { name: 'Hepsiburada', icon: '📦', color: '#FF6000' },
  n11: { name: 'n11', icon: '⭐', color: '#8B5CF6' },
  trendyol: { name: 'Trendyol', icon: '👗', color: '#F27A1A' },
  gitti_gidiyor: { name: 'GittiGidiyor', icon: '🛍️', color: '#FF6B35' },
  sahibinden: { name: 'Sahibinden', icon: '🏠', color: '#00A651' },
  letgo: { name: 'Letgo', icon: '📱', color: '#FF6B6B' },
  dolap: { name: 'Dolap', icon: '👜', color: '#FF6B9D' },
  vakko: { name: 'Vakko', icon: '👔', color: '#000000' },
  beymen: { name: 'Beymen', icon: '👕', color: '#1E3A8A' },
  defacto: { name: 'DeFacto', icon: '👖', color: '#DC2626' }
} as const;

export const BADGE_TYPES = {
  verified_seller: { name: 'Doğrulanmış Satıcı', icon: '✅', color: '#10B981' },
  top_seller: { name: 'Üst Satıcı', icon: '🏆', color: '#F59E0B' },
  premium_seller: { name: 'Premium Satıcı', icon: '💎', color: '#8B5CF6' },
  fast_shipping: { name: 'Hızlı Kargo', icon: '🚀', color: '#3B82F6' },
  best_price: { name: 'En İyi Fiyat', icon: '💰', color: '#10B981' }
} as const;

// Üye kademesi hesaplama fonksiyonu
export const getMemberLevel = (points: number): MemberLevel => {
  if (points >= 4000) return MEMBER_LEVELS.DIAMOND;
  if (points >= 3000) return MEMBER_LEVELS.EMERALD;
  if (points >= 2000) return MEMBER_LEVELS.GOLD;
  if (points >= 1000) return MEMBER_LEVELS.SILVER;
  return MEMBER_LEVELS.BRONZE;
};

// Üye kademesi emoji'sini alma fonksiyonu
export const getMemberEmoji = (points: number): string => {
  return getMemberLevel(points).icon;
};

// Puan formatını düzenleme fonksiyonu
export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

// Tarih formatını düzenleme fonksiyonu
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Utility fonksiyonları
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const generateUsername = (email: string): string => {
  const base = email.split('@')[0];
  const clean = base.replace(/[^a-zA-Z0-9]/g, '');
  return clean.length >= 3 ? clean : clean + Math.random().toString(36).substr(2, 5);
}; 