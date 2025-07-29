-- Update home_city_id column to allow text values for pseudo-IDs
-- This allows us to store city names that aren't in the cities table yet

-- First, drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_home_city_id_fkey;

-- Change the column type from UUID to TEXT
ALTER TABLE users ALTER COLUMN home_city_id TYPE TEXT USING home_city_id::TEXT;

-- Add a check constraint to ensure it's either a valid UUID or a pseudo-ID
ALTER TABLE users ADD CONSTRAINT home_city_id_format CHECK (
  home_city_id IS NULL OR
  home_city_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' OR -- UUID format
  home_city_id ~ '^city-[a-z0-9-]+$' -- Pseudo-ID format
);