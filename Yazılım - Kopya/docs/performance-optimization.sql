-- 9. Create a scheduled job to refresh popular topics (runs daily at 2 AM)
-- Note: This requires pg_cron extension to be installed
-- SELECT cron.schedule('refresh-popular-topics', '0 2 * * *', 'SELECT refresh_popular_topics();');-- Performance Optimization SQL Script
-- This script adds indexes and optimizations to improve query performance

-- 1. Add indexes for topics table
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_title_content ON topics USING gin(to_tsvector('turkish', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_topics_likes_count ON topics(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_topics_comments_count ON topics(comments_count DESC);

-- 2. Add indexes for comments table
CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 3. Add indexes for topic_likes table
CREATE INDEX IF NOT EXISTS idx_topic_likes_topic_id ON topic_likes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_likes_user_id ON topic_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_likes_like_type ON topic_likes(like_type);

-- 4. Add indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order, name);

-- 5. Add indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles USING gin(to_tsvector('turkish', username));

-- 6. Add indexes for user_points table
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);

-- 7. Create a materialized view for popular topics (updated daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_topics AS
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
    -- Calculate popularity score
    (COALESCE(t.likes_count, 0) * 2 + COALESCE(t.comments_count, 0) * 3) as popularity_score
FROM topics t
LEFT JOIN profiles p ON t.user_id = p.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN user_points up ON t.user_id = up.user_id
WHERE t.created_at >= NOW() - INTERVAL '30 days'
ORDER BY popularity_score DESC, t.created_at DESC
LIMIT 100;

-- 7.1 Create a unique index on the materialized view (required for concurrent refresh)
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_topics_id ON popular_topics(id);

-- 8. Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_popular_topics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW popular_topics;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a scheduled job to refresh popular topics (runs daily at 2 AM)
-- Note: This requires pg_cron extension to be installed
-- SELECT cron.schedule('refresh-popular-topics', '0 2 * * *', 'SELECT refresh_popular_topics();');

-- 10. Create a function to get topics with optimized joins
CREATE OR REPLACE FUNCTION get_topics_with_details(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_category_id UUID DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    user_id UUID,
    category_id UUID,
    likes_count INTEGER,
    dislikes_count INTEGER,
    comments_count INTEGER,
    username TEXT,
    avatar_url TEXT,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    category_slug TEXT,
    user_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
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
        c.name,
        c.icon,
        c.color,
        c.slug,
        COALESCE(up.points, 0)
    FROM topics t
    LEFT JOIN profiles p ON t.user_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN user_points up ON t.user_id = up.user_id
    WHERE 
        (p_category_id IS NULL OR t.category_id = p_category_id)
        AND (p_search_query IS NULL OR 
             t.title ILIKE '%' || p_search_query || '%' OR 
             t.content ILIKE '%' || p_search_query || '%')
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 11. Create a function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_topics(
    p_query TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    user_id UUID,
    category_id UUID,
    likes_count INTEGER,
    dislikes_count INTEGER,
    comments_count INTEGER,
    username TEXT,
    avatar_url TEXT,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    category_slug TEXT,
    user_points INTEGER,
    rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
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
        c.name,
        c.icon,
        c.color,
        c.slug,
        COALESCE(up.points, 0),
        ts_rank(to_tsvector('turkish', t.title || ' ' || t.content), plainto_tsquery('turkish', p_query)) as rank
    FROM topics t
    LEFT JOIN profiles p ON t.user_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN user_points up ON t.user_id = up.user_id
    WHERE to_tsvector('turkish', t.title || ' ' || t.content) @@ plainto_tsquery('turkish', p_query)
    ORDER BY rank DESC, t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 12. Add statistics collection for better query planning
ANALYZE topics;
ANALYZE comments;
ANALYZE topic_likes;
ANALYZE categories;
ANALYZE profiles;
ANALYZE user_points;

-- 13. Create a function to clean up old data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete comments older than 2 years
    DELETE FROM comments WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Delete topic likes older than 2 years
    DELETE FROM topic_likes WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Vacuum tables to reclaim space
    VACUUM ANALYZE comments;
    VACUUM ANALYZE topic_likes;
END;
$$ LANGUAGE plpgsql;

-- 14. Create a function to get category statistics
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    category_slug TEXT,
    topic_count BIGINT,
    total_likes BIGINT,
    total_comments BIGINT,
    last_activity TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        c.slug,
        COUNT(t.id) as topic_count,
        COALESCE(SUM(t.likes_count), 0) as total_likes,
        COALESCE(SUM(t.comments_count), 0) as total_comments,
        MAX(t.created_at) as last_activity
    FROM categories c
    LEFT JOIN topics t ON c.id = t.category_id
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.icon, c.color, c.slug
    ORDER BY topic_count DESC, last_activity DESC;
END;
$$ LANGUAGE plpgsql;

-- 15. Create indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_topics_category_created ON topics(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_user_created ON topics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_topic_created ON comments(topic_id, created_at DESC);

-- 16. Create a partial index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(id) WHERE is_active = true;

-- 17. Create a composite index for topic likes
CREATE INDEX IF NOT EXISTS idx_topic_likes_topic_type ON topic_likes(topic_id, like_type);

-- 18. Add comments to help with maintenance
COMMENT ON INDEX idx_topics_created_at IS 'Index for sorting topics by creation date';
COMMENT ON INDEX idx_topics_title_content IS 'Full-text search index for topics';
COMMENT ON INDEX idx_topics_category_id IS 'Index for filtering topics by category';
COMMENT ON MATERIALIZED VIEW popular_topics IS 'Cached view of popular topics for better performance';

-- 19. Create a function to monitor query performance
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
    FROM pg_stat_statements
    WHERE mean_time > 100  -- Queries taking more than 100ms on average
    ORDER BY mean_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 20. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_topics_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION search_topics TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_stats TO authenticated;
GRANT SELECT ON popular_topics TO authenticated;