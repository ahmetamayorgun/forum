import React from 'react';
import { useLikes } from '../hooks/useLikes';

interface LikeButtonsProps {
  likesCount: number;
  dislikesCount: number;
  userLike: 'like' | 'dislike' | null;
  onLike: (type: 'like' | 'dislike') => void;
  disabled?: boolean;
}

const LikeButtons: React.FC<LikeButtonsProps> = ({
  likesCount,
  dislikesCount,
  userLike,
  onLike,
  disabled = false
}) => {
  const { loading } = useLikes();

  const handleLike = (type: 'like' | 'dislike') => {
    if (disabled || loading) return;
    onLike(type);
  };

  return (
    <div className="like-buttons">
      <button
        className={`like-button like ${userLike === 'like' ? 'active' : ''}`}
        onClick={() => handleLike('like')}
        disabled={disabled || loading}
        title="Beğen"
      >
        <span className="like-icon">👍</span>
        <span className="like-count">{likesCount}</span>
      </button>
      
      <button
        className={`like-button dislike ${userLike === 'dislike' ? 'active' : ''}`}
        onClick={() => handleLike('dislike')}
        disabled={disabled || loading}
        title="Beğenme"
      >
        <span className="like-icon">👎</span>
        <span className="like-count">{dislikesCount}</span>
      </button>
    </div>
  );
};

export default LikeButtons; 