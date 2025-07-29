-- Add city_image_url column to airports table
ALTER TABLE airports ADD COLUMN IF NOT EXISTS city_image_url TEXT;