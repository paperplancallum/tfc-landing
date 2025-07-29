-- Run this SQL in your Supabase Dashboard SQL Editor
-- Navigate to: https://supabase.com/dashboard/project/[your-project-ref]/sql/new

-- Check if Barcelona already exists
SELECT * FROM cities WHERE iata_code = 'BCN';

-- Add Barcelona to cities table if it doesn't exist
INSERT INTO cities (name, iata_code, timezone)
VALUES ('Barcelona', 'BCN', 'Europe/Madrid')
ON CONFLICT (iata_code) DO NOTHING;

-- Verify Barcelona was added
SELECT * FROM cities WHERE iata_code = 'BCN';