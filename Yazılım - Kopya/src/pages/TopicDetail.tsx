import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Topic, Comment, formatDate } from '../lib/supabase';
import LikeButtons from '../components/LikeButtons';
import MemberLevel from '../components/MemberLevel';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TopicComments from '../components/TopicComments';
import { useLikes } from '../hooks/useLikes';

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { handleTopicLike, handleCommentLike } = useLikes();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTopicLikes = useCallback(async (topicData: Topic): Promise<Topic> => {
    try {
      // Beğeni sayılarını al
      const { data: likeCounts } = await supabase.rpc('get_topic_like_count', {
        topic_uuid: topicData.id
      });

      // Kullanıcının beğenisini al
      let userLike: 'like' | 'dislike' | null = null;
      if (user) {
        const { data: userLikeData } = await supabase
          .from('topic_likes')
          .select('like_type')
          .eq('topic_id', topicData.id)
          .eq('user_id', user.id)
          .single();

        if (userLikeData) {
          userLike = userLikeData.like_type;
        }
      }

      // Kullanıcı puanlarını al
      let userWithPoints = topicData.user;
      if (topicData.user) {
        const { data: userPointsData } = await supabase
          .from('user_points')
          .select('points')
          .eq('user_id', topicData.user.id)
          .single();

        if (userPointsData) {
          userWithPoints = {
            ...topicData.user,
            points: { points: userPointsData.points } as any
          };
        }
      }

      return {
        ...topicData,
        user: userWithPoints,
        likes_count: likeCounts?.[0]?.likes_count || 0,
        dislikes_count: likeCounts?.[0]?.dislikes_count || 0,
        user_like: userLike
      };
    } catch (error) {
      console.error('Error fetching topic likes:', error);
      return topicData;
    }
  }, [user]);

  const fetchCommentLikes = useCallback(async (commentData: Comment): Promise<Comment> => {
    try {
      // Beğeni sayılarını al
      const { data: likeCounts } = await supabase.rpc('get_comment_like_count', {
        comment_uuid: commentData.id
      });

      // Kullanıcının beğenisini al
      let userLike: 'like' | 'dislike' | null = null;
      if (user) {
        const { data: userLikeData } = await supabase
          .from('comment_likes')
          .select('like_type')
          .eq('comment_id', commentData.id)
          .eq('user_id', user.id)
          .single();

        if (userLikeData) {
          userLike = userLikeData.like_type;
        }
      }

      // Kullanıcı puanlarını al
      let userWithPoints = commentData.user;
      if (commentData.user) {
        const { data: userPointsData } = await supabase
          .from('user_points')
          .select('points')
          .eq('user_id', commentData.user.id)
          .single();

        if (userPointsData) {
          userWithPoints = {
            ...commentData.user,
            points: { points: userPointsData.points } as any
          };
        }
      }

      return {
        ...commentData,
        user: userWithPoints,
        likes_count: likeCounts?.[0]?.likes_count || 0,
        dislikes_count: likeCounts?.[0]?.dislikes_count || 0,
        user_like: userLike
      };
    } catch (error) {
      console.error('Error fetching comment likes:', error);
      return commentData;
    }
  }, [user]);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');

        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select(`
            *,
            user:profiles(
              id,
              username,
              avatar_url
            ),
            category:categories(
              id,
              name,
              icon,
              color,
              slug
            )
          `)
          .eq('id', id)
          .single();

        if (topicError) {
          throw topicError;
        }

        if (topicData) {
          const topicWithLikes = await fetchTopicLikes(topicData);
          setTopic(topicWithLikes);
        }

        // Yorumları al
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(
              id,
              username,
              avatar_url
            )
          `)
          .eq('topic_id', id)
          .order('created_at', { ascending: true });

        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
        } else if (commentsData) {
          const commentsWithLikes = await Promise.all(
            commentsData.map(comment => fetchCommentLikes(comment))
          );
          setComments(commentsWithLikes);
        }

      } catch (err: any) {
        console.error('Error fetching topic:', err);
        setError(err.message || 'Başlık yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id, fetchTopicLikes, fetchCommentLikes]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      setError('');

      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          topic_id: topic.id,
          user_id: user.id
        })
        .select(`
          *,
          user:profiles(
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (commentError) {
        throw commentError;
      }

      if (commentData) {
        const commentWithLikes = await fetchCommentLikes(commentData);
        setComments(prev => [...prev, commentWithLikes]);
        setNewComment('');
      }

    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Yorum eklenirken bir hata oluştu');
    } finally {
      setCommentLoading(false);
    }
  };

  const onTopicLike = async (likeType: 'like' | 'dislike') => {
    if (!topic || !user) return;
    
    const result = await handleTopicLike(topic.id, likeType);
    
    if (result.success) {
      // Beğeni işlemi başarılı, topic'i yeniden yükle
      const updatedTopic = await fetchTopicLikes(topic);
      setTopic(updatedTopic);
    }
  };

  const onCommentLike = async (commentId: string, likeType: 'like' | 'dislike') => {
    if (!user) return;
    
    const result = await handleCommentLike(commentId, likeType);
    
    if (result.success) {
      // Beğeni işlemi başarılı, yorumları yeniden yükle
      const updatedComments = await Promise.all(
        comments.map(comment => 
          comment.id === commentId 
            ? fetchCommentLikes(comment)
            : Promise.resolve(comment)
        )
      );
      setComments(updatedComments);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Hata
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link to="/" className="btn-primary">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Başlık Bulunamadı
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Aradığınız başlık mevcut değil veya silinmiş olabilir.
          </p>
          <Link to="/" className="btn-primary">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              Ana Sayfa
            </Link>
            <span>›</span>
            {topic.category && (
              <>
                <Link 
                  to={`/category/${topic.category.slug}`}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  {topic.category.icon} {topic.category.name}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-slate-900 dark:text-slate-100 font-medium">
              {topic.title}
            </span>
          </nav>
        </div>

        {/* Topic */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {topic.user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/profile/${topic.user?.username}`}
                    className="font-semibold text-slate-900 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {topic.user?.username || 'Anonim'}
                  </Link>
                  {topic.user?.points && (
                    <MemberLevel 
                      points={topic.user.points.points} 
                      size="small"
                    />
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(topic.created_at)}
                </div>
              </div>
            </div>
            {topic.category && (
              <span 
                className="px-3 py-1 text-sm rounded-full text-white"
                style={{ backgroundColor: topic.category.color }}
              >
                {topic.category.icon} {topic.category.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {topic.title}
          </h1>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <MarkdownRenderer content={topic.content} />
          </div>
          
          {/* Topic Like Buttons */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <LikeButtons
              likesCount={topic.likes_count || 0}
              dislikesCount={topic.dislikes_count || 0}
              userLike={topic.user_like || null}
              onLike={onTopicLike}
              disabled={!user}
            />
          </div>
        </div>

        {/* Comments Section */}
        <TopicComments
          comments={comments}
          loading={loading}
          commentLoading={commentLoading}
          newComment={newComment}
          error={error}
          onNewCommentChange={setNewComment}
          onAddComment={handleAddComment}
          onCommentLike={onCommentLike}
        />
      </div>
    </div>
  );
};

export default TopicDetail; 