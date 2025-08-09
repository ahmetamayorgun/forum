import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CategoryList from '../components/CategoryList';

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                📂 Tüm Kategoriler
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                Forum kategorilerini keşfedin ve ilgi alanlarınıza göre başlıkları filtreleyin
              </p>
            </div>
            
            {user && (
              <div className="flex-shrink-0">
                <Link 
                  to="/create-topic" 
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">✏️</span>
                  Yeni Başlık Oluştur
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Categories Content */}
        <div className="mb-12">
          <CategoryList />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Kategori İstatistikleri
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Her kategori için başlık sayısı, yorum sayısı ve etkileşim oranları gösterilir.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Kategori Seçimi
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Başlık oluştururken uygun kategoriyi seçerek içeriğinizin daha kolay bulunmasını sağlayın.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Kolay Navigasyon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Kategorilere tıklayarak o kategoriye ait tüm başlıkları görüntüleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">🚀 Hızlı Başlangıç</h3>
            <p className="mb-4 text-red-100">
              Henüz hesabınız yok mu? Hemen kayıt olun ve forum topluluğuna katılın!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                📝 Kayıt Ol
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-red-600 transition-colors"
              >
                🔑 Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 