-- Add email preferences for existing users who don't have them
-- This ensures all users can receive daily deal emails

-- Insert email preferences for users who don't have them yet
INSERT INTO email_preferences (user_id, email_frequency, is_subscribed)
SELECT 
  u.id,
  'daily' AS email_frequency,
  true AS is_subscribed
FROM users u
LEFT JOIN email_preferences ep ON u.id = ep.user_id
WHERE ep.id IS NULL;

-- Log how many preferences were created
DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Created email preferences for % users', affected_rows;
END $$;

-- Verify the results
SELECT 
  COUNT(DISTINCT u.id) AS total_users,
  COUNT(DISTINCT ep.user_id) AS users_with_preferences,
  COUNT(DISTINCT CASE WHEN ep.email_frequency = 'daily' THEN ep.user_id END) AS daily_subscribers,
  COUNT(DISTINCT CASE WHEN ep.is_subscribed = true THEN ep.user_id END) AS active_subscribers
FROM users u
LEFT JOIN email_preferences ep ON u.id = ep.user_id;