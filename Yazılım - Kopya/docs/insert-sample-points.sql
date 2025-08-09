-- Örnek puan verileri ekleme
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Mevcut kullanıcılar için örnek puanlar ekle
INSERT INTO user_points (user_id, points, total_topics, total_comments, total_likes_received)
SELECT 
  p.id,
  -- Rastgele puanlar (1000-5000 arası)
  FLOOR(RANDOM() * 4000 + 1000) as points,
  -- Rastgele başlık sayısı (1-20 arası)
  FLOOR(RANDOM() * 20 + 1) as total_topics,
  -- Rastgele yorum sayısı (5-50 arası)
  FLOOR(RANDOM() * 45 + 5) as total_comments,
  -- Rastgele beğeni sayısı (10-200 arası)
  FLOOR(RANDOM() * 190 + 10) as total_likes_received
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_points up WHERE up.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Örnek puan geçmişi ekle
INSERT INTO points_history (user_id, points_earned, points_type, source_id, source_type)
SELECT 
  up.user_id,
  CASE 
    WHEN ph.points_type = 'topic_created' THEN 100
    WHEN ph.points_type = 'comment_created' THEN 30
    WHEN ph.points_type = 'like_received' THEN 10
  END as points_earned,
  ph.points_type,
  gen_random_uuid() as source_id,
  CASE 
    WHEN ph.points_type = 'topic_created' THEN 'topic'
    WHEN ph.points_type = 'comment_created' THEN 'comment'
    WHEN ph.points_type = 'like_received' THEN 'topic'
  END as source_type
FROM user_points up
CROSS JOIN (
  SELECT 'topic_created' as points_type
  UNION ALL SELECT 'comment_created'
  UNION ALL SELECT 'like_received'
) ph
CROSS JOIN GENERATE_SERIES(1, FLOOR(RANDOM() * 10 + 5)) as gs
WHERE up.points > 0
ON CONFLICT DO NOTHING;

-- Üye seviyesi geçmişini güncelle
INSERT INTO member_level_history (user_id, old_level, new_level, points_at_change)
SELECT 
  up.user_id,
  'bronz' as old_level,
  CASE 
    WHEN up.points >= 4000 THEN 'zümrüt'
    WHEN up.points >= 3000 THEN 'elmas'
    WHEN up.points >= 2000 THEN 'altın'
    WHEN up.points >= 1000 THEN 'gümüş'
    ELSE 'bronz'
  END as new_level,
  up.points
FROM user_points up
WHERE up.points > 0
ON CONFLICT DO NOTHING;

-- Puan istatistiklerini görüntüle
SELECT 
  'Puan Sistemi İstatistikleri' as title,
  COUNT(*) as total_users,
  COUNT(CASE WHEN points >= 1000 THEN 1 END) as silver_users,
  COUNT(CASE WHEN points >= 2000 THEN 1 END) as gold_users,
  COUNT(CASE WHEN points >= 3000 THEN 1 END) as diamond_users,
  COUNT(CASE WHEN points >= 4000 THEN 1 END) as emerald_users,
  AVG(points) as average_points,
  MAX(points) as max_points
FROM user_points;

-- En yüksek puanlı kullanıcıları görüntüle
SELECT 
  p.username,
  p.email,
  up.points,
  up.total_topics,
  up.total_comments,
  up.total_likes_received,
  CASE 
    WHEN up.points >= 4000 THEN 'zümrüt'
    WHEN up.points >= 3000 THEN 'elmas'
    WHEN up.points >= 2000 THEN 'altın'
    WHEN up.points >= 1000 THEN 'gümüş'
    ELSE 'bronz'
  END as member_level,
  CASE 
    WHEN up.points >= 4000 THEN '💎'
    WHEN up.points >= 3000 THEN '💠'
    WHEN up.points >= 2000 THEN '🥇'
    WHEN up.points >= 1000 THEN '🥈'
    ELSE '🥉'
  END as member_emoji
FROM user_points up
JOIN profiles p ON up.user_id = p.id
ORDER BY up.points DESC
LIMIT 10; 