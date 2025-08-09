import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CategoryList from '../components/CategoryList';
import SearchBar from '../components/SearchBar';
import ThreeBackground from '../components/ThreeBackground';

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  user: {
    username: string;
    avatar_url?: string;
    points: number;
  };
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTopics = async () => {
    try {
      console.log('Fetching topics...');
      
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Supabase error:', error);
        // Hata durumunda boş array kullan, fallback veriler kaldırıldı
        setTopics([]);
        return;
      }

      console.log('Topics data:', data);
      
      // Verileri güvenli hale getir ve kullanıcı bilgilerini al
      const safeTopics = await Promise.all((data || []).map(async (topic) => {
        // Kullanıcı bilgilerini al
        let userInfo = {
          username: 'Anonim',
          avatar_url: undefined,
          points: 0
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
              
              userInfo.points = pointsData?.points || 0;
            }
          } catch (userError) {
            console.log('User data not found, using default');
          }
        }

        return {
          ...topic,
          user: userInfo,
          likes_count: topic.likes_count || 0,
          dislikes_count: topic.dislikes_count || 0,
          comments_count: topic.comments_count || 0
        };
      }));
      
      setTopics(safeTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Hata durumunda boş array kullan
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const getTimeAgo = (dateString: string) => {
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

  const filteredTopics = topics.filter(topic => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const topicDate = new Date(topic.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return topicDate > oneDayAgo;
    }
    if (filter === 'popular') {
      return topic.likes_count > 5;
    }
    return true;
  });

  if (loading) {
    return (
      <ThreeBackground className="min-h-screen">
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </ThreeBackground>
    );
  }

  return (
    <ThreeBackground className="min-h-screen">
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section - Donanım Haber Tarzı */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">S</span>
                </div>
                                 <div>
                   <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                     Satıcıyız Forum
                   </h1>
                   <p className="text-slate-600 dark:text-slate-400">
                     Alışveriş ve satış dünyasından en güncel fırsatlar
                   </p>
                 </div>
              </div>
              <div className="flex space-x-3">
                {user ? (
                  <Link to="/create-topic" className="btn-primary">
                    + Yeni Konu
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary">
                      Kayıt Ol
                    </Link>
                    <Link to="/login" className="btn-secondary">
                      Giriş Yap
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="card p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <SearchBar placeholder="Forum içinde ara..." />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filter === 'all'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setFilter('recent')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filter === 'recent'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Son 24 Saat
                  </button>
                  <button
                    onClick={() => setFilter('popular')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filter === 'popular'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Popüler
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Kategoriler
              </h2>
              <CategoryList />
            </div>
          </div>

          {/* Topics Section - Donanım Haber Tarzı */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Son Konular
              </h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {filteredTopics.length} konu
              </div>
            </div>

            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="card p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-red-500">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {topic.user?.username?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    </div>

                    {/* Topic Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link 
                          to={`/topic/${topic.id}`}
                          className="block group flex-1"
                        >
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 line-clamp-2">
                            {topic.title}
                          </h3>
                        </Link>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {topic.content}
                      </p>
                      
                      {/* Topic Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-red-500">👤</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {topic.user?.username || 'Anonim'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400">🕒</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {getTimeAgo(topic.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-green-500">👍</span>
                            <span className="text-slate-600 dark:text-slate-400">{topic.likes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-red-500">👎</span>
                            <span className="text-slate-600 dark:text-slate-400">{topic.dislikes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-blue-500">💬</span>
                            <span className="text-slate-600 dark:text-slate-400">{topic.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTopics.length === 0 && (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Henüz konu yok
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  İlk konuyu oluşturarak forumu başlatın!
                </p>
                {user && (
                  <Link to="/create-topic" className="btn-primary">
                    + İlk Konuyu Oluştur
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ThreeBackground>
  );
};

export default Home; 