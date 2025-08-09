import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Comment, formatDate } from '../lib/supabase';
import LikeButtons from './LikeButtons';
import MemberLevel from './MemberLevel';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownEditor from './MarkdownEditor';

interface TopicCommentsProps {
  comments: Comment[];
  loading: boolean;
  commentLoading: boolean;
  newComment: string;
  error?: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  onCommentLike: (commentId: string, likeType: 'like' | 'dislike') => void;
}

const TopicComments: React.FC<TopicCommentsProps> = ({
  comments,
  loading,
  commentLoading,
  newComment,
  error,
  onNewCommentChange,
  onAddComment,
  onCommentLike
}) => {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-l-4 border-slate-200 dark:border-slate-700 pl-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Yorumlar ({comments.length})
      </h2>

      {/* Add Comment Form */}
      {user && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Yorum Ekle
          </h3>
          <form onSubmit={onAddComment} className="space-y-4">
            <MarkdownEditor
              value={newComment}
              onChange={onNewCommentChange}
              placeholder="Yorumunuzu yazın..."
              className="min-h-[120px]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? 'Gönderiliyor...' : 'Yorum Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-slate-600 dark:text-slate-400">
              Henüz yorum yapılmamış. İlk yorumu siz yapın!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {comment.user.username}
                    </span>
                    {comment.user.points && (
                      <MemberLevel points={comment.user.points.points} />
                    )}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-3">
                <MarkdownRenderer content={comment.content} />
              </div>
              
              <div className="flex items-center gap-4">
                <LikeButtons
                  likesCount={comment.likes_count || 0}
                  dislikesCount={comment.dislikes_count || 0}
                  userLike={comment.user_like || null}
                  onLike={(type) => onCommentLike(comment.id, type)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopicComments;
