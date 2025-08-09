import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

import { createLikeNotification } from '../lib/notifications';

interface LikeResult {
  success: boolean;
  error?: string;
  action?: 'added' | 'removed' | 'updated';
}

export const useLikes = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleTopicLike = useCallback(async (
    topicId: string, 
    likeType: 'like' | 'dislike'
  ): Promise<LikeResult> => {
    if (!user) {
      const errorMsg = 'Giriş yapmanız gerekiyor';
      setError(errorMsg);
      toast.showWarning('Uyarı', errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      console.debug(`Handling topic like: ${topicId}, type: ${likeType}`);

      // Önce mevcut beğeniyi kontrol et
      const { data: existingLike, error: fetchError } = await supabase
        .from('topic_likes')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing topic like:', fetchError);
        setError('Beğeni durumu kontrol edilemedi');
        return { success: false, error: 'Beğeni durumu kontrol edilemedi' };
      }

      if (existingLike) {
        if (existingLike.like_type === likeType) {
          // Aynı beğeni türüne tıklandıysa beğeniyi kaldır
          const { error: deleteError } = await supabase
            .from('topic_likes')
            .delete()
            .eq('id', existingLike.id);

          if (deleteError) {
            console.error('Error removing topic like:', deleteError);
            setError('Beğeni kaldırılamadı');
            return { success: false, error: 'Beğeni kaldırılamadı' };
          }

          console.log('Topic like removed successfully');
          return { success: true, action: 'removed' };
        } else {
          // Farklı beğeni türüne tıklandıysa güncelle
          const { error: updateError } = await supabase
            .from('topic_likes')
            .update({ like_type: likeType })
            .eq('id', existingLike.id);

          if (updateError) {
            console.error('Error updating topic like:', updateError);
            setError('Beğeni güncellenemedi');
            return { success: false, error: 'Beğeni güncellenemedi' };
          }

          console.log('Topic like updated successfully');
          return { success: true, action: 'updated' };
        }
      } else {
        // Yeni beğeni ekle
        const { error: insertError } = await supabase
          .from('topic_likes')
          .insert({
            topic_id: topicId,
            user_id: user.id,
            like_type: likeType
          });

        if (insertError) {
          console.error('Error adding topic like:', insertError);
          setError('Beğeni eklenemedi');
          return { success: false, error: 'Beğeni eklenemedi' };
        }

        console.log('Topic like added successfully');
        
        // Bildirim oluştur (sadece like için, dislike için değil)
        if (likeType === 'like') {
          try {
            // Topic sahibini bul
            const { data: topic } = await supabase
              .from('topics')
              .select('user_id, title')
              .eq('id', topicId)
              .single();
            
            if (topic && topic.user_id !== user.id) {
              await createLikeNotification(
                topic.user_id,
                user.username || 'Bir kullanıcı',
                'topic',
                topic.title,
                topicId
              );
            }
          } catch (notificationError) {
            console.error('Error creating like notification:', notificationError);
            // Bildirim hatası ana işlemi etkilemesin
          }
        }
        
        return { success: true, action: 'added' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
      console.error('Unexpected error handling topic like:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

    const handleCommentLike = useCallback(async (
    commentId: string, 
    likeType: 'like' | 'dislike'
  ): Promise<LikeResult> => {
    if (!user) {
      const errorMsg = 'Giriş yapmanız gerekiyor';
      setError(errorMsg);
      toast.showWarning('Uyarı', errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      console.debug(`Handling comment like: ${commentId}, type: ${likeType}`);

      // Önce mevcut beğeniyi kontrol et
      const { data: existingLike, error: fetchError } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing comment like:', fetchError);
        setError('Beğeni durumu kontrol edilemedi');
        return { success: false, error: 'Beğeni durumu kontrol edilemedi' };
      }

      if (existingLike) {
        if (existingLike.like_type === likeType) {
          // Aynı beğeni türüne tıklandıysa beğeniyi kaldır
          const { error: deleteError } = await supabase
            .from('comment_likes')
            .delete()
            .eq('id', existingLike.id);

          if (deleteError) {
            console.error('Error removing comment like:', deleteError);
            setError('Beğeni kaldırılamadı');
            return { success: false, error: 'Beğeni kaldırılamadı' };
            }

          console.log('Comment like removed successfully');
          return { success: true, action: 'removed' };
        } else {
          // Farklı beğeni türüne tıklandıysa güncelle
          const { error: updateError } = await supabase
            .from('comment_likes')
            .update({ like_type: likeType })
            .eq('id', existingLike.id);

          if (updateError) {
            console.error('Error updating comment like:', updateError);
            setError('Beğeni güncellenemedi');
            return { success: false, error: 'Beğeni güncellenemedi' };
          }

          console.log('Comment like updated successfully');
          return { success: true, action: 'updated' };
        }
      } else {
        // Yeni beğeni ekle
        const { error: insertError } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            like_type: likeType
          });

        if (insertError) {
          console.error('Error adding comment like:', insertError);
          setError('Beğeni eklenemedi');
          return { success: false, error: 'Beğeni eklenemedi' };
        }

        console.log('Comment like added successfully');
        
        // Bildirim oluştur (sadece like için, dislike için değil)
        if (likeType === 'like') {
          try {
            // Comment sahibini bul
            const { data: comment } = await supabase
              .from('comments')
              .select('user_id, content')
              .eq('id', commentId)
              .single();
            
            if (comment && comment.user_id !== user.id) {
              await createLikeNotification(
                comment.user_id,
                user.username || 'Bir kullanıcı',
                'comment',
                comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
                commentId
              );
            }
          } catch (notificationError) {
            console.error('Error creating comment like notification:', notificationError);
            // Bildirim hatası ana işlemi etkilemesin
          }
        }
        
        return { success: true, action: 'added' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
      console.error('Unexpected error handling comment like:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    handleTopicLike,
    handleCommentLike,
    loading,
    error,
    clearError
  };
}; 