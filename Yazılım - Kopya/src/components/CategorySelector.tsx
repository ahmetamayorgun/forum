import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
  showDescription?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategoryChange,
  placeholder = 'Kategori seçin...',
  className = '',
  showIcon = true,
  showDescription = false
}) => {
  const { categories, loading, error } = useCategories();

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  if (loading) {
    return (
      <div className={`category-selector ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="loading-spinner"></div>
          <span className="text-slate-600 dark:text-slate-400">Kategoriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`category-selector ${className}`}>
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`category-selector ${className}`}>
      <select
        value={selectedCategoryId || ''}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="category-select"
      >
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {showIcon ? `${category.icon} ` : ''}{category.name}
            {showDescription && category.description ? ` - ${category.description}` : ''}
          </option>
        ))}
      </select>
      
      {selectedCategory && (
        <div className="selected-category-info">
          <span 
            className="category-icon" 
            style={{ color: selectedCategory.color }}
          >
            {selectedCategory.icon}
          </span>
          <div className="flex flex-col">
            <span className="category-name">{selectedCategory.name}</span>
            {showDescription && selectedCategory.description && (
              <span className="category-description">{selectedCategory.description}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector; 