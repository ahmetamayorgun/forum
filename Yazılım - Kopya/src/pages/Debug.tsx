import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Debug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const gatherDebugInfo = async () => {
      try {
        const info: any = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          authLoading,
          user: user ? {
            id: user.id,
            email: user.email,
            username: user.username,
            created_at: user.created_at
          } : null
        };

        // Supabase connection test
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          info.session = {
            hasSession: !!sessionData.session,
            error: sessionError?.message || null,
            user: sessionData.session?.user ? {
              id: sessionData.session.user.id,
              email: sessionData.session.user.email,
              metadata: sessionData.session.user.user_metadata
            } : null
          };
        } catch (error) {
          info.session = { error: (error as Error).message };
        }

        // Test database connection
        try {
          const { error: testError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
          info.database = {
            connected: !testError,
            error: testError?.message || null
          };
        } catch (error) {
          info.database = { error: (error as Error).message };
        }

        // Check localStorage
        try {
          const authKey = 'saticiyiz-forum-auth';
          const authData = localStorage.getItem(authKey);
          info.localStorage = {
            hasAuthData: !!authData,
            authKey,
            authDataLength: authData?.length || 0
          };
        } catch (error) {
          info.localStorage = { error: (error as Error).message };
        }

        // Check cookies
        try {
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          info.cookies = {
            count: Object.keys(cookies).length,
            keys: Object.keys(cookies),
            hasCloudflareCookies: Object.keys(cookies).some(key => 
              key.includes('__cf') || key.includes('cf_')
            )
          };
        } catch (error) {
          info.cookies = { error: (error as Error).message };
        }

        setDebugInfo(info);
      } catch (error) {
        setDebugInfo({ error: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };

    gatherDebugInfo();
  }, [authLoading, user]);

  const testLogin = async () => {
    try {
      console.log('Testing login with test credentials...');
      
      // İlk olarak test@example.com ile dene
      let { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456'
      });
      
      // Eğer başarısız olursa demo@test.com ile dene
      if (error) {
        console.log('First login failed, trying demo user...');
        const { error: demoError } = await supabase.auth.signInWithPassword({
          email: 'demo@test.com',
          password: 'demo123'
        });
        
        if (demoError) {
          alert(`Both login attempts failed:\n1. test@example.com: ${error.message}\n2. demo@test.com: ${demoError.message}`);
        } else {
          alert('Login test successful with demo user!');
          window.location.reload();
        }
      } else {
        alert('Login test successful with test user!');
        window.location.reload();
      }
    } catch (error) {
      alert(`Login test error: ${(error as Error).message}`);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert('Storage cleared!');
      window.location.reload();
    } catch (error) {
      alert(`Error clearing storage: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Debug bilgileri toplanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">🔧 Debug Sayfası</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Test Login (test@example.com)
            </button>
            
            <button
              onClick={clearStorage}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Storage Temizle
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">📊 Debug Bilgileri</h3>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold mb-2">⚠️ Sorun Giderme</h3>
              <ul className="text-sm space-y-1">
                <li>• Session yoksa: Test login butonuna tıklayın</li>
                <li>• Database bağlantı hatası: Supabase ayarlarını kontrol edin</li>
                <li>• Cookie sorunları: Storage temizle butonuna tıklayın</li>
                <li>• Cloudflare sorunları: Cookie'leri temizleyin</li>
              </ul>
            </div>

                         <div className="bg-green-50 p-4 rounded">
               <h3 className="font-semibold mb-2">✅ Test Kullanıcıları</h3>
               <div className="text-sm space-y-2">
                 <div>
                   <strong>Test User 1:</strong><br/>
                   Email: test@example.com<br/>
                   Şifre: test123456<br/>
                   Kullanıcı Adı: testuser
                 </div>
                 <div>
                   <strong>Test User 2 (Alternatif):</strong><br/>
                   Email: demo@test.com<br/>
                   Şifre: demo123<br/>
                   Kullanıcı Adı: demouser
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;
