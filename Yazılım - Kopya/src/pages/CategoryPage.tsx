import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Category, Topic, formatDate } from '../lib/supabase';
import { useCategories } from '../hooks/useCategories';
import MarkdownRenderer from '../components/MarkdownRenderer';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { loading: categoriesLoading, error: categoriesError, getCategoryBySlug } = useCategories();
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'oldest'>('newest');

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!slug || categoriesLoading) return;

      try {
        setLoading(true);
        setError(null);

        // Kategori bilgilerini al
        const categoryData = getCategoryBySlug(slug);
        if (!categoryData) {
          setError('Kategori bulunamadı');
          return;
        }
        setCategory(categoryData);

        // Kategoriye ait başlıkları al
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*')
          .eq('category_id', categoryData.id)
          .order(sortBy === 'newest' ? 'created_at' : sortBy === 'oldest' ? 'created_at' : 'id', 
                 { ascending: sortBy === 'oldest' })
          .limit(50);

        if (topicsError) {
          console.error('Error fetching topics:', topicsError);
          setError('Başlıklar yüklenirken hata oluştu');
          return;
        }

        // Verileri dönüştür ve beğeni/yorum sayılarını al
        const processedTopics = await Promise.all((topicsData || []).map(async (topic: any) => {
          // Yorum sayısını al
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          // Beğeni sayılarını al
          const { data: likesData } = await supabase
            .from('topic_likes')
            .select('like_type')
            .eq('topic_id', topic.id);

          const likesCount = likesData?.filter(like => like.like_type === 'like').length || 0;
          const dislikesCount = likesData?.filter(like => like.like_type === 'dislike').length || 0;

          // Kullanıcı bilgilerini al
          let userInfo = {
            username: 'Anonim',
            avatar_url: undefined,
            points: { points: 0 }
          };

          if (topic.user_id) {
            try {
              const { data: userData } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', topic.user_id)
                .single();

              if (userData) {
                userInfo.username = userData.username || 'Anonim';
                userInfo.avatar_url = userData.avatar_url;

                // Kullanıcı puanlarını al
                const { data: pointsData } = await supabase
                  .from('user_points')
                  .select('points')
                  .eq('user_id', topic.user_id)
                  .single();
                
                userInfo.points = { points: pointsData?.points || 0 };
              }
            } catch (userError) {
              console.log('User data not found, using default');
            }
          }

          return {
            ...topic,
            comments_count: commentsCount || 0,
            likes_count: likesCount,
            dislikes_count: dislikesCount,
            user: userInfo
          };
        }));

        setTopics(processedTopics);
      } catch (err) {
        console.error('Error loading category data:', err);
        setError('Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [slug, getCategoryBySlug, sortBy, categoriesLoading]);

  const getTimeAgo = (dateString: string) => {
    return formatDate(dateString);
  };

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Kategori yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || categoriesError || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Hata</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error || categoriesError || 'Kategori bulunamadı'}</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              🏠 Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start space-x-4 mb-6 lg:mb-0">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <span className="text-lg">📝</span>
                      <span className="font-semibold">{category.topic_count}</span>
                      <span>Başlık</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {user && (
                  <Link 
                    to="/create-topic" 
                    className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">✏️</span>
                    Yeni Başlık Oluştur
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-0">
              Başlıklar ({topics.length})
            </h2>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sırala:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="newest">En Yeni</option>
                <option value="popular">En Popüler</option>
                <option value="oldest">En Eski</option>
              </select>
            </div>
          </div>

          {topics.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Bu kategoride henüz başlık yok
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                İlk başlığı oluşturmak için aşağıdaki butona tıklayın.
              </p>
              {user && (
                <Link 
                  to="/create-topic" 
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <span className="mr-2">✏️</span>
                  İlk Başlığı Oluştur
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {topic.user?.avatar_url ? (
                        <img src={topic.user.avatar_url} alt={topic.user.username || 'Kullanıcı'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (topic.user?.username || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {topic.user?.username || 'Anonim Kullanıcı'}
                        </span>
                        <span className="text-lg">
                          {(topic.user?.points?.points || 0) >= 4000 ? '💎' : 
                           (topic.user?.points?.points || 0) >= 3000 ? '💠' : 
                           (topic.user?.points?.points || 0) >= 2000 ? '🥇' : 
                           (topic.user?.points?.points || 0) >= 1000 ? '🥈' : '🥉'}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {getTimeAgo(topic.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Link to={`/topic/${topic.id}`} className="block">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        {topic.title}
                      </h3>
                      <div className="text-slate-600 dark:text-slate-400 line-clamp-3">
                        <MarkdownRenderer content={topic.content.substring(0, 200)} />
                        {topic.content.length > 200 && '...'}
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{topic.comments_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>👍</span>
                        <span>{topic.likes_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>👎</span>
                        <span>{topic.dislikes_count}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 