import React from 'react';
import { Link } from 'react-router-dom';
import { Topic } from '../lib/supabase';

interface UserTopicsProps {
  topics: Topic[];
  loading: boolean;
}

const UserTopics: React.FC<UserTopicsProps> = ({ topics, loading }) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} ay önce`;
    return `${Math.floor(diffInSeconds / 31536000)} yıl önce`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Konular ({topics.length})
      </h2>
      
      {topics.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-slate-600 dark:text-slate-400">
            Henüz konu paylaşılmamış.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Link to={`/topic/${topic.id}`} className="block">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  {topic.content}
                </p>
                <div className="flex items-center justify-between mt-3 text-sm text-slate-500 dark:text-slate-400">
                  <span>{getTimeAgo(topic.created_at)}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {topic.comments_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {topic.likes_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTopics;
