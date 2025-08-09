import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';

export interface SearchFilters {
  category?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popular';
  author?: string;
  hasComments?: boolean;
  hasLikes?: boolean;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ""
}) => {
  const { categories } = useCategories();
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
          <span className="font-medium">Filtreler</span>
          {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters} 
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
          >
            Temizle
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Kategori Filtresi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Kategori
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tarih Filtresi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tarih Aralığı
            </label>
            <select
              value={filters.dateRange || 'all'}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>
          </div>

          {/* Sıralama */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sıralama
            </label>
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="relevance">İlgi Sırası</option>
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>

          {/* Yazar Filtresi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Yazar
            </label>
            <input
              type="text"
              value={filters.author || ''}
              onChange={(e) => updateFilter('author', e.target.value || undefined)}
              placeholder="Kullanıcı adı..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Checkbox Filtreleri */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasComments"
                checked={filters.hasComments || false}
                onChange={(e) => updateFilter('hasComments', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-100 border-slate-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="hasComments" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Yorumu olan başlıklar
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasLikes"
                checked={filters.hasLikes || false}
                onChange={(e) => updateFilter('hasLikes', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-slate-100 border-slate-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="hasLikes" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Beğenisi olan başlıklar
              </label>
            </div>
          </div>

          {/* Aktif Filtreler */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Aktif Filtreler:
              </h4>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
                    Kategori: {categories.find(c => c.id === filters.category)?.name}
                  </span>
                )}
                {filters.dateRange && filters.dateRange !== 'all' && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                    Tarih: {filters.dateRange}
                  </span>
                )}
                {filters.author && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                    Yazar: {filters.author}
                  </span>
                )}
                {filters.hasComments && (
                  <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full">
                    Yorumlu
                  </span>
                )}
                {filters.hasLikes && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                    Beğenili
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent; 