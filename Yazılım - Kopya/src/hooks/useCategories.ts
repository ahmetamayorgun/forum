import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, Category } from '../lib/supabase';

// Category tree type
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// Cache for categories
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first
      const now = Date.now();
      if (!forceRefresh && categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setCategories(categoriesCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        setError('Kategoriler yüklenirken hata oluştu');
        return;
      }

      const categoriesData = data || [];
      setCategories(categoriesData);
      
      // Update cache
      categoriesCache = categoriesData;
      cacheTimestamp = now;
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized functions to prevent unnecessary re-renders
  const getCategoryById = useMemo(() => {
    return (id: string): Category | undefined => {
      return categories.find(cat => cat.id === id);
    };
  }, [categories]);

  const getCategoryBySlug = useMemo(() => {
    return (slug: string): Category | undefined => {
      return categories.find(cat => cat.slug === slug);
    };
  }, [categories]);

  const getCategoryTree = useMemo(() => {
    return (): CategoryWithChildren[] => {
      const categoryMap = new Map<string, CategoryWithChildren>();
      const rootCategories: CategoryWithChildren[] = [];

      // Create a map of all categories with children array
      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Build the tree structure
      categories.forEach(cat => {
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            const childCategory = categoryMap.get(cat.id);
            if (childCategory) {
              parent.children.push(childCategory);
            }
          }
        } else {
          const rootCategory = categoryMap.get(cat.id);
          if (rootCategory) {
            rootCategories.push(rootCategory);
          }
        }
      });

      return rootCategories;
    };
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    getCategoryBySlug,
    getCategoryTree,
  };
}; 