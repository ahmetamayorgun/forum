import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MarkdownEditor from '../components/MarkdownEditor';
import CategorySelector from '../components/CategorySelector';

const CreateTopic: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSponsored, setIsSponsored] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Lütfen başlık ve içerik alanlarını doldurun');
      return;
    }

    if (!user) {
      setError('Başlık oluşturmak için giriş yapmalısınız');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Başlığı hazırla
      let finalTitle = title.trim();
      
      // Sponsor işaretlemesi ekle
      if (isSponsored) {
        finalTitle = `${finalTitle} [SPONSOR]`;
      }
      
      const { data, error: insertError } = await supabase
        .from('topics')
        .insert([
          {
            title: finalTitle,
            content: content.trim(),
            user_id: user.id,
            category_id: categoryId || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/topic/${data.id}`);
    } catch (error: any) {
      setError(error.message || 'Başlık oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Giriş Gerekli
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Başlık oluşturmak için lütfen giriş yapın.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              ✨ Yeni Başlık Oluştur
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Topluluğa katkıda bulunmak için yeni bir başlık oluşturun.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kategori
              </label>
              <CategorySelector
                selectedCategoryId={categoryId}
                onCategoryChange={setCategoryId}
                placeholder="Kategori seçin (opsiyonel)"
                showIcon={true}
                showDescription={true}
              />
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Başlık
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlığınızı buraya yazın..."
                required
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                İçerik (Markdown Desteği)
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Markdown formatında içeriğinizi yazın..."
                maxLength={5000}
                autoSave={true}
                autoSaveInterval={30000}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                💡 İpucu: Klavye kısayollarını kullanabilirsiniz (Ctrl+B, Ctrl+I, Ctrl+K)
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sponsored"
                checked={isSponsored}
                onChange={(e) => setIsSponsored(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-100 border-slate-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="sponsored" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Bu bir sponsorlu içeriktir
              </label>
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Oluşturuluyor...' : 'Başlık Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTopic; 