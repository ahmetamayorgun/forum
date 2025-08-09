import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase, Topic, formatDate } from '../lib/supabase';
import SearchBar from '../components/SearchBar';
import SearchFiltersComponent, { SearchFilters as SearchFiltersType } from '../components/SearchFilters';
import MarkdownRenderer from '../components/MarkdownRenderer';

// Debounce utility function
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const RESULTS_PER_PAGE = 20;

  // Debounce query and filters for search
  const debouncedQuery = useDebounce(query, 500);
  const debouncedFilters = useDebounce(filters, 300);

  // URL'den query ve filtreleri al
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
    
    // URL'den filtreleri parse et
    const urlFilters: SearchFiltersType = {};
    const category = searchParams.get('category');
    const dateRange = searchParams.get('dateRange') as any;
    const sortBy = searchParams.get('sortBy') as any;
    const author = searchParams.get('author');
    const hasComments = searchParams.get('hasComments') === 'true';
    const hasLikes = searchParams.get('hasLikes') === 'true';

    if (category) urlFilters.category = category;
    if (dateRange) urlFilters.dateRange = dateRange;
    if (sortBy) urlFilters.sortBy = sortBy;
    if (author) urlFilters.author = author;
    if (hasComments) urlFilters.hasComments = true;
    if (hasLikes) urlFilters.hasLikes = true;

    setFilters(urlFilters);
    setCurrentPage(1);
  }, [searchParams]);

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let searchQuery = supabase
        .from('topics')
        .select(`
          *,
          user:profiles(
            id,
            username,
            avatar_url,
            points:user_points(points)
          ),
          category:categories(
            id,
            name,
            icon,
            color,
            slug
          ),
          comments:comments(count),
          topic_likes(count)
        `);

      // Full-text search
      if (debouncedQuery.trim()) {
        searchQuery = searchQuery.or(`title.ilike.%${debouncedQuery}%,content.ilike.%${debouncedQuery}%`);
      }

      // Kategori filtresi
      if (debouncedFilters.category) {
        searchQuery = searchQuery.eq('category_id', debouncedFilters.category);
      }

      // Tarih filtresi
      if (debouncedFilters.dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (debouncedFilters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        searchQuery = searchQuery.gte('created_at', startDate.toISOString());
      }

      // Yazar filtresi
      if (debouncedFilters.author) {
        searchQuery = searchQuery.eq('user.username', debouncedFilters.author);
      }

      // Sıralama
      if (debouncedFilters.sortBy) {
        switch (debouncedFilters.sortBy) {
          case 'newest':
            searchQuery = searchQuery.order('created_at', { ascending: false });
            break;
          case 'oldest':
            searchQuery = searchQuery.order('created_at', { ascending: true });
            break;
          case 'popular':
            searchQuery = searchQuery.order('likes_count', { ascending: false });
            break;
          case 'relevance':
          default:
            searchQuery = searchQuery.order('created_at', { ascending: false });
            break;
        }
      } else {
        searchQuery = searchQuery.order('created_at', { ascending: false });
      }

      // Sayfalama
      const from = (currentPage - 1) * RESULTS_PER_PAGE;
      const to = from + RESULTS_PER_PAGE - 1;
      searchQuery = searchQuery.range(from, to);

      const { data, error: searchError, count } = await searchQuery;

      if (searchError) {
        throw searchError;
      }

      if (currentPage === 1) {
        setResults(data || []);
      } else {
        setResults(prev => [...prev, ...(data || [])]);
      }

      setTotalResults(count || 0);
      setHasMore((data?.length || 0) === RESULTS_PER_PAGE);

    } catch (err) {
      console.error('Search error:', err);
      setError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, debouncedFilters, currentPage]);

  // Search effect
  useEffect(() => {
    if (debouncedQuery || Object.keys(debouncedFilters).length > 0) {
      performSearch();
    }
  }, [debouncedQuery, debouncedFilters, performSearch]);

  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // URL'yi güncelle
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('q', query);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value.toString());
      }
    });
    
    setSearchParams(newSearchParams);
  }, [query, setSearchParams]);

  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  }, []);

  const getTimeAgo = useCallback((dateString: string) => {
    return formatDate(dateString);
  }, []);

  const renderedResults = useMemo(() => {
    return results.map((topic) => (
      <div key={topic.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {topic.user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {topic.user?.username || 'Anonim'}
                </span>
                {topic.category && (
                  <span 
                    className="px-2 py-1 text-xs rounded-full text-white"
                    style={{ backgroundColor: topic.category.color }}
                  >
                    {topic.category.icon} {topic.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Link to={`/topic/${topic.id}`} className="block">
          <h3 
            className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
            dangerouslySetInnerHTML={{ 
              __html: highlightText(topic.title, query) 
            }} 
          />
        </Link>
        
        <div className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
          <MarkdownRenderer 
            content={topic.content.substring(0, 200) + (topic.content.length > 200 ? '...' : '')}
          />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1">
            <span>💬</span>
            <span>{topic.comments_count || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>👍</span>
            <span>{topic.likes_count || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>👎</span>
            <span>{topic.dislikes_count || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>🕒</span>
            <span>{getTimeAgo(topic.created_at)}</span>
          </span>
        </div>
      </div>
    ));
  }, [results, query, getTimeAgo, highlightText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            🔍 Arama Sonuçları
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            "{query}" için {totalResults} sonuç bulundu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SearchFiltersComponent 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-6">
              <SearchBar 
                placeholder="Arama yapın..."
              />
            </div>

            {loading && currentPage === 1 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="ml-3 text-slate-600 dark:text-slate-400">Aranıyor...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Hata</h3>
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </div>
            ) : results.length === 0 && query ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Sonuç bulunamadı
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  "{query}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {renderedResults}
                </div>
                
                {hasMore && (
                  <div className="text-center mt-8">
                    <button 
                      onClick={loadMore}
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 