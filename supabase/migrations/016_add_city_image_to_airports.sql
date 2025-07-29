-- Add city_image_url column to airports table
ALTER TABLE airports 
ADD COLUMN IF NOT EXISTS city_image_url TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_airports_city_image_url ON airports(city_image_url);

-- Update the search_airports function to include city_image_url
CREATE OR REPLACE FUNCTION search_airports(search_term TEXT)
RETURNS TABLE (
  airport_id UUID,
  airport_code VARCHAR(3),
  airport_name TEXT,
  city_name VARCHAR(255),
  country VARCHAR(255),
  city_image_url TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    iata_code,
    name,
    airports.city_name,
    airports.country,
    airports.city_image_url,
    airports.is_primary
  FROM airports
  WHERE 
    LOWER(iata_code) LIKE LOWER(search_term || '%')
    OR LOWER(name) LIKE LOWER('%' || search_term || '%')
    OR LOWER(airports.city_name) LIKE LOWER('%' || search_term || '%')
    OR LOWER(airports.country) LIKE LOWER('%' || search_term || '%')
  ORDER BY 
    CASE 
      WHEN LOWER(iata_code) = LOWER(search_term) THEN 1
      WHEN LOWER(iata_code) LIKE LOWER(search_term || '%') THEN 2
      WHEN LOWER(name) LIKE LOWER(search_term || '%') THEN 3
      WHEN LOWER(airports.city_name) LIKE LOWER(search_term || '%') THEN 4
      WHEN LOWER(airports.country) LIKE LOWER(search_term || '%') THEN 5
      ELSE 6
    END,
    is_primary DESC,
    name;
END;
$$ LANGUAGE plpgsql;

-- Update the get_city_airports function to include city_image_url
CREATE OR REPLACE FUNCTION get_city_airports(city_name_param TEXT)
RETURNS TABLE (
  airport_id UUID,
  airport_code VARCHAR(3),
  airport_name TEXT,
  city_name VARCHAR(255),
  country VARCHAR(255),
  city_image_url TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.iata_code,
    a.name,
    a.city_name,
    a.country,
    a.city_image_url,
    a.is_primary
  FROM airports a
  WHERE LOWER(REPLACE(a.city_name, ' ', '-')) = LOWER(city_name_param)
     OR LOWER(a.city_name) = LOWER(city_name_param);
END;
$$ LANGUAGE plpgsql;

-- Update the get_airport_by_code function to include city_image_url
CREATE OR REPLACE FUNCTION get_airport_by_code(iata_code_param VARCHAR(3))
RETURNS TABLE (
  airport_id UUID,
  airport_code VARCHAR(3),
  airport_name TEXT,
  city_id UUID,
  city_name VARCHAR(255),
  country VARCHAR(255),
  city_image_url TEXT,
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
    a.country,
    a.city_image_url,
    a.is_primary
  FROM airports a
  WHERE UPPER(a.iata_code) = UPPER(iata_code_param);
END;
$$ LANGUAGE plpgsql;