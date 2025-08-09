import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, User } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setError(null);
      console.log('Fetching user profile for:', userId);
      
      // Önce session'dan kullanıcı bilgilerini al
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.error('No session found');
        return;
      }

      // Basit bir kullanıcı objesi oluştur
      const fallbackUser = {
        id: userId,
        username: session.session.user.user_metadata?.username || 'user_' + userId.slice(0, 8),
        email: session.session.user.email || '',
        created_at: new Date().toISOString()
      } as User;
      
      console.log('Setting user from session:', fallbackUser);
      setUser(fallbackUser);
      
      // Arka planda profil bilgilerini almaya çalış (hata durumunda session verilerini kullan)
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!fetchError && data) {
          console.log('Successfully fetched user profile from database:', data);
          
          // Kullanıcı puanlarını ayrı sorgu ile al
          let userPoints = 0;
          try {
            const { data: pointsData } = await supabase
              .from('user_points')
              .select('points')
              .eq('user_id', userId)
              .single();
            
            userPoints = pointsData?.points || 0;
          } catch (pointsError) {
            console.log('Could not fetch user points:', pointsError);
          }
          
          // Profil verilerini puanlarla birleştir
          const userWithPoints = {
            ...data,
            points: userPoints
          };
          
          setUser(userWithPoints);
        } else {
          console.log('Profile not found in database, using session data');
          // Profil bulunamazsa session verilerini kullan (zaten set edildi)
        }
      } catch (dbError) {
        console.log('Database error, using session data:', dbError);
        // Veritabanı hatası durumunda session verilerini kullan (zaten set edildi)
      }
      
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Hata durumunda bile session verilerini kullanmaya çalış
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user) {
          const fallbackUser = {
            id: session.session.user.id,
            username: session.session.user.user_metadata?.username || 'user_' + session.session.user.id.slice(0, 8),
            email: session.session.user.email || '',
            created_at: new Date().toISOString()
          } as User;
          setUser(fallbackUser);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id);
        }
             } catch (err) {
         console.error('Error initializing auth:', err);
         if (mounted) {
           setError('Kimlik doğrulama başlatılamadı.');
           toast.showError('Hata', 'Kimlik doğrulama başlatılamadı.');
         }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        try {
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
          }
                 } catch (err) {
           console.error('Error in auth state change:', err);
           setError('Kimlik doğrulama durumu güncellenemedi.');
           toast.showError('Hata', 'Kimlik doğrulama durumu güncellenemedi.');
         } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, toast]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Starting signup process for:', email, username);

      // Sadece auth signup işlemini yap - hiçbir ek işlem yapma
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        console.error('Error details:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name
        });
        throw signUpError;
      }

      console.log('Auth signup successful, user:', data.user?.id);
      console.log('User data:', data.user);
      console.log('Session data:', data.session);
      console.log('Signup process completed successfully');
      
    } catch (err) {
      console.error('Sign up error:', err);
      console.error('Error type:', typeof err);
      console.error('Error constructor:', err?.constructor?.name);
      
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific Supabase errors
        if (errorMessage.includes('duplicate key')) {
          errorMessage = 'Bu email adresi zaten kullanılıyor.';
        } else if (errorMessage.includes('invalid email')) {
          errorMessage = 'Geçersiz email adresi.';
        } else if (errorMessage.includes('weak password')) {
          errorMessage = 'Şifre çok zayıf.';
        } else if (errorMessage.includes('Database error')) {
          errorMessage = 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.';
        }
      }
      
      setError(errorMessage);
      toast.showError('Kayıt Hatası', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('=== AUTH CONTEXT SIGN IN DEBUG ===');
      console.log('Signing in with email:', email);
      console.log('Password length:', password.length);
      console.log('Current timestamp:', new Date().toISOString());
      
      // Test Supabase connection
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase.auth.getSession();
      console.log('Session test result:', { testData, testError });
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data, error: signInError });

      if (signInError) {
        console.error('Sign in error details:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name,
          stack: signInError.stack
        });
        throw signInError;
      }
      
      console.log('Auth sign in successful, user:', data.user?.id);
      console.log('User data:', data.user);
      console.log('Session data:', data.session);
      
      if (data.user) {
        console.log('Setting user from auth data...');
        // Hemen session verilerinden kullanıcı objesi oluştur
        const userFromAuth = {
          id: data.user.id,
          username: data.user.user_metadata?.username || 'user_' + data.user.id.slice(0, 8),
          email: data.user.email || '',
          created_at: new Date().toISOString()
        } as User;
        
        setUser(userFromAuth);
        console.log('User set from auth data:', userFromAuth);
        
        // Arka planda profil bilgilerini almaya çalış
        setTimeout(() => {
          fetchUserProfile(data.user.id);
        }, 100);
      }
      
      console.log('=== AUTH CONTEXT SIGN IN DEBUG END ===');
      
    } catch (err) {
      console.error('=== AUTH CONTEXT SIGN IN ERROR ===');
      console.error('Sign in error:', err);
      console.error('Error type:', typeof err);
      console.error('Error constructor:', err?.constructor?.name);
      console.error('Error message:', (err as any)?.message);
      console.error('Error details:', err);
      console.error('=== AUTH CONTEXT SIGN IN ERROR END ===');
      
      const errorMessage = err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu.';
      setError(errorMessage);
      toast.showError('Giriş Hatası', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile, toast]);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      setUser(null);
         } catch (err) {
       console.error('Sign out error:', err);
       const errorMessage = err instanceof Error ? err.message : 'Çıkış yapılırken bir hata oluştu.';
       setError(errorMessage);
       toast.showError('Çıkış Hatası', errorMessage);
       throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    refreshUser,
  }), [user, loading, error, signUp, signIn, signOut, clearError, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 