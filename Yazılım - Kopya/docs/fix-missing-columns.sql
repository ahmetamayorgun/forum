-- Fix missing columns in topics table
-- This script adds the missing likes_count and dislikes_count columns

-- 1. Add likes_count column to topics table
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. Add dislikes_count column to topics table
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0;

-- 3. Add comments_count column to topics table if it doesn't exist
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 4. Update existing topics with calculated values
UPDATE topics 
SET likes_count = (
    SELECT COUNT(*) 
    FROM topic_likes 
    WHERE topic_likes.topic_id = topics.id 
    AND topic_likes.like_type = 'like'
)
WHERE likes_count = 0;

UPDATE topics 
SET dislikes_count = (
    SELECT COUNT(*) 
    FROM topic_likes 
    WHERE topic_likes.topic_id = topics.id 
    AND topic_likes.like_type = 'dislike'
)
WHERE dislikes_count = 0;

UPDATE topics 
SET comments_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.topic_id = topics.id
)
WHERE comments_count = 0;

-- 5. Create a function to update topic counts when likes/dislikes change
CREATE OR REPLACE FUNCTION update_topic_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.like_type = 'like' THEN
            UPDATE topics 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.topic_id;
        ELSIF NEW.like_type = 'dislike' THEN
            UPDATE topics 
            SET dislikes_count = dislikes_count + 1 
            WHERE id = NEW.topic_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.like_type = 'like' THEN
            UPDATE topics 
            SET likes_count = GREATEST(likes_count - 1, 0) 
            WHERE id = OLD.topic_id;
        ELSIF OLD.like_type = 'dislike' THEN
            UPDATE topics 
            SET dislikes_count = GREATEST(dislikes_count - 1, 0) 
            WHERE id = OLD.topic_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle like type change
        IF OLD.like_type = 'like' AND NEW.like_type = 'dislike' THEN
            UPDATE topics 
            SET likes_count = GREATEST(likes_count - 1, 0),
                dislikes_count = dislikes_count + 1 
            WHERE id = NEW.topic_id;
        ELSIF OLD.like_type = 'dislike' AND NEW.like_type = 'like' THEN
            UPDATE topics 
            SET dislikes_count = GREATEST(dislikes_count - 1, 0),
                likes_count = likes_count + 1 
            WHERE id = NEW.topic_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a function to update topic comment count when comments change
CREATE OR REPLACE FUNCTION update_topic_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE topics 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.topic_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE topics 
        SET comments_count = GREATEST(comments_count - 1, 0) 
        WHERE id = OLD.topic_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for topic_likes table
DROP TRIGGER IF EXISTS trigger_update_topic_counts ON topic_likes;
CREATE TRIGGER trigger_update_topic_counts
    AFTER INSERT OR UPDATE OR DELETE ON topic_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_topic_counts();

-- 8. Create triggers for comments table
DROP TRIGGER IF EXISTS trigger_update_topic_comment_count ON comments;
CREATE TRIGGER trigger_update_topic_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_topic_comment_count();

-- 9. Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_topics_likes_count ON topics(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_topics_dislikes_count ON topics(dislikes_count DESC);
CREATE INDEX IF NOT EXISTS idx_topics_comments_count ON topics(comments_count DESC);

-- 10. Update the materialized view to use the new columns
DROP MATERIALIZED VIEW IF EXISTS popular_topics;
CREATE MATERIALIZED VIEW popular_topics AS
SELECT 
    t.id,
    t.title,
    t.content,
    t.created_at,
    t.user_id,
    t.category_id,
    t.likes_count,
    t.dislikes_count,
    t.comments_count,
    p.username,
    p.avatar_url,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    c.slug as category_slug,
    up.points as user_points,
    -- Calculate popularity score using the new columns
    (COALESCE(t.likes_count, 0) * 2 + COALESCE(t.comments_count, 0) * 3) as popularity_score
FROM topics t
LEFT JOIN profiles p ON t.user_id = p.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN user_points up ON t.user_id = up.user_id
WHERE t.created_at >= NOW() - INTERVAL '30 days'
ORDER BY popularity_score DESC, t.created_at DESC
LIMIT 100;

-- 11. Grant permissions
GRANT SELECT ON popular_topics TO authenticated;

-- 12. Add comments for documentation
COMMENT ON COLUMN topics.likes_count IS 'Number of likes for this topic';
COMMENT ON COLUMN topics.dislikes_count IS 'Number of dislikes for this topic';
COMMENT ON COLUMN topics.comments_count IS 'Number of comments for this topic';
COMMENT ON FUNCTION update_topic_counts() IS 'Automatically updates topic like/dislike counts when topic_likes change';
COMMENT ON FUNCTION update_topic_comment_count() IS 'Automatically updates topic comment count when comments change'; 