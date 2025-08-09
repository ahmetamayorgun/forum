import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  slug: string;
  topic_count: number;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
          // Demo data
          setCategories([
            { id: '1', name: 'Elektronik', description: 'Telefon, tablet ve elektronik ürünler', icon: '📱', color: '#ef4444', slug: 'elektronik', topic_count: 45 },
            { id: '2', name: 'Bilgisayar', description: 'PC, laptop ve bilgisayar parçaları', icon: '💻', color: '#f59e0b', slug: 'bilgisayar', topic_count: 38 },
            { id: '3', name: 'Giyim & Aksesuar', description: 'Kıyafet, ayakkabı ve aksesuarlar', icon: '👕', color: '#10b981', slug: 'giyim-aksesuar', topic_count: 22 },
            { id: '4', name: 'Ev & Yaşam', description: 'Ev eşyaları ve yaşam ürünleri', icon: '🏠', color: '#3b82f6', slug: 'ev-yasam', topic_count: 31 },
            { id: '5', name: 'Spor & Outdoor', description: 'Spor ekipmanları ve outdoor ürünler', icon: '⚽', color: '#8b5cf6', slug: 'spor-outdoor', topic_count: 28 },
            { id: '6', name: 'Kozmetik & Sağlık', description: 'Kozmetik ve sağlık ürünleri', icon: '💄', color: '#ec4899', slug: 'kozmetik-saglik', topic_count: 35 }
          ]);
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="card p-4 hover:scale-105 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 truncate">
                {category.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {category.topic_count} başlık
              </p>
            </div>
            <div className="text-slate-400 group-hover:text-primary-500 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList; 