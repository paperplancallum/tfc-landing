-- Add city_name column to airports table for easier reference
ALTER TABLE airports 
ADD COLUMN IF NOT EXISTS city_name VARCHAR(255);

-- Update existing airports with city names from the cities table
UPDATE airports a
SET city_name = c.name
FROM cities c
WHERE a.city_id = c.id
AND a.city_name IS NULL;

-- Make city_name NOT NULL after populating data
ALTER TABLE airports
ALTER COLUMN city_name SET NOT NULL;

-- Create an index on city_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_airports_city_name ON airports(city_name);

-- Update the get_city_airports function to include city_name
CREATE OR REPLACE FUNCTION get_city_airports(city_name_param TEXT)
RETURNS TABLE (
  airport_id UUID,
  airport_code VARCHAR(3),
  airport_name TEXT,
  city_name VARCHAR(255),
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.iata_code,
    a.name,
    a.city_name,
    a.is_primary
  FROM airports a
  WHERE LOWER(REPLACE(a.city_name, ' ', '-')) = LOWER(city_name_param)
     OR LOWER(a.city_name) = LOWER(city_name_param);
END;
$$ LANGUAGE plpgsql;

-- Add a function to get airport details by IATA code
CREATE OR REPLACE FUNCTION get_airport_by_code(iata_code_param VARCHAR(3))
RETURNS TABLE (
  airport_id UUID,
  airport_code VARCHAR(3),
  airport_name TEXT,
  city_id UUID,
  city_name VARCHAR(255),
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.iata_code,
    a.name,
    a.city_id,
    a.city_name,
    a.is_primary
  FROM airports a
  WHERE UPPER(a.iata_code) = UPPER(iata_code_param);
END;
$$ LANGUAGE plpgsql;