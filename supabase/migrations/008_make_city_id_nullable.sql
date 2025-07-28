-- Make departure_city_id nullable since we're now using airport codes directly
ALTER TABLE deals 
ALTER COLUMN departure_city_id DROP NOT NULL;

-- Also make departure_airport_id nullable if it exists
ALTER TABLE deals 
ALTER COLUMN departure_airport_id DROP NOT NULL;