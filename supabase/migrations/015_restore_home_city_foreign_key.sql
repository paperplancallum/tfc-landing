-- Restore foreign key constraint on users.home_city_id
-- This ensures users can only select from curated cities in the cities table

-- First, we need to clean up any pseudo-IDs that might exist
UPDATE users 
SET home_city_id = NULL 
WHERE home_city_id LIKE 'city-%';

-- Change the column back to UUID type
ALTER TABLE users 
ALTER COLUMN home_city_id TYPE UUID 
USING home_city_id::UUID;

-- Re-add the foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT users_home_city_id_fkey 
FOREIGN KEY (home_city_id) 
REFERENCES cities(id) 
ON DELETE SET NULL;

-- Remove the check constraint that allowed pseudo-IDs
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS home_city_id_format;