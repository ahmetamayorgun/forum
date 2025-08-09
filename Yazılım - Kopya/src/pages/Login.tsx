import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      console.log('=== LOGIN DEBUG START ===');
      console.log('Attempting to sign in with:', email);
      console.log('Password length:', password.length);
      console.log('Current timestamp:', new Date().toISOString());
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      
      await signIn(email, password);
      
      console.log('Sign in successful, navigating to home...');
      console.log('=== LOGIN DEBUG END ===');
      
      navigate('/');
    } catch (error: any) {
      console.error('=== LOGIN ERROR DEBUG ===');
      console.error('Login error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error details:', error);
      console.error('=== LOGIN ERROR DEBUG END ===');
      
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error?.message) {
        errorMessage = error.message;
        
        // Handle specific Supabase errors
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Geçersiz email veya şifre';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Email adresinizi onaylamanız gerekiyor';
        } else if (errorMessage.includes('Too many requests')) {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin';
        } else if (errorMessage.includes('Network error')) {
          errorMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
            🔑
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Giriş Yap
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Hesabınıza giriş yapın ve tartışmalara katılın
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="ornek@email.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg font-medium text-white transition-all duration-200 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <span className="mr-2">🔑</span>
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Veya
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hesabınız yok mu?{' '}
              <Link 
                to="/register" 
                className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                📝 Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Giriş yaparak{' '}
            <Link to="/terms" className="underline hover:text-slate-700 dark:hover:text-slate-300">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link to="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 