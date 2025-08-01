-- This migration populates the cities table with all unique departure cities from deals
-- and creates a trigger to automatically add new cities when deals are inserted

-- First, add any missing cities from existing deals
-- We'll use the first 3 letters of the city name as a default IATA code
-- and UTC as the default timezone (can be updated later)
INSERT INTO cities (name, iata_code, timezone)
SELECT DISTINCT 
  from_airport_city as name,
  -- Generate a pseudo IATA code from the city name
  CASE 
    WHEN LENGTH(from_airport_city) >= 3 THEN UPPER(LEFT(REPLACE(from_airport_city, ' ', ''), 3))
    ELSE UPPER(RPAD(REPLACE(from_airport_city, ' ', ''), 3, 'X'))
  END as iata_code,
  'UTC' as timezone -- Default timezone, can be updated later
FROM deals
WHERE from_airport_city IS NOT NULL
  AND from_airport_city != ''
  AND from_airport_city NOT IN (SELECT name FROM cities)
ON CONFLICT (iata_code) DO NOTHING; -- Skip if IATA code already exists

-- Handle any cities that were skipped due to IATA code conflicts
-- by appending a number to make them unique
WITH duplicate_cities AS (
  SELECT DISTINCT 
    d.from_airport_city,
    CASE 
      WHEN LENGTH(d.from_airport_city) >= 3 THEN UPPER(LEFT(REPLACE(d.from_airport_city, ' ', ''), 3))
      ELSE UPPER(RPAD(REPLACE(d.from_airport_city, ' ', ''), 3, 'X'))
    END as base_iata
  FROM deals d
  WHERE d.from_airport_city IS NOT NULL
    AND d.from_airport_city != ''
    AND d.from_airport_city NOT IN (SELECT name FROM cities)
)
INSERT INTO cities (name, iata_code, timezone)
SELECT 
  from_airport_city as name,
  -- Generate unique IATA code by appending number if needed
  base_iata || 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM cities WHERE iata_code = base_iata) THEN ''
    ELSE (ROW_NUMBER() OVER (PARTITION BY base_iata ORDER BY from_airport_city))::text
  END as iata_code,
  'UTC' as timezone
FROM duplicate_cities
ON CONFLICT (iata_code) DO NOTHING;

-- Create function to automatically add cities from new deals
CREATE OR REPLACE FUNCTION auto_add_city_from_deal()
RETURNS TRIGGER AS $$
DECLARE
  v_iata_code VARCHAR(3);
  v_base_iata VARCHAR(3);
  v_counter INTEGER := 1;
BEGIN
  -- Only proceed if from_airport_city is not null and not already in cities table
  IF NEW.from_airport_city IS NOT NULL 
    AND NEW.from_airport_city != ''
    AND NOT EXISTS (SELECT 1 FROM cities WHERE name = NEW.from_airport_city) THEN
    
    -- Generate base IATA code
    v_base_iata := CASE 
      WHEN LENGTH(NEW.from_airport_city) >= 3 THEN UPPER(LEFT(REPLACE(NEW.from_airport_city, ' ', ''), 3))
      ELSE UPPER(RPAD(REPLACE(NEW.from_airport_city, ' ', ''), 3, 'X'))
    END;
    
    v_iata_code := v_base_iata;
    
    -- Check if IATA code already exists and generate unique one if needed
    WHILE EXISTS (SELECT 1 FROM cities WHERE iata_code = v_iata_code) LOOP
      v_iata_code := v_base_iata || v_counter::text;
      v_counter := v_counter + 1;
      
      -- Safety check to prevent infinite loop
      IF v_counter > 99 THEN
        RAISE EXCEPTION 'Could not generate unique IATA code for city: %', NEW.from_airport_city;
      END IF;
    END LOOP;
    
    -- Insert the new city
    INSERT INTO cities (name, iata_code, timezone)
    VALUES (NEW.from_airport_city, v_iata_code, 'UTC')
    ON CONFLICT (name) DO NOTHING; -- Just in case of race condition
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-add cities from new deals
DROP TRIGGER IF EXISTS ensure_departure_city_exists ON deals;
CREATE TRIGGER ensure_departure_city_exists
AFTER INSERT OR UPDATE OF from_airport_city ON deals
FOR EACH ROW
EXECUTE FUNCTION auto_add_city_from_deal();

-- Add an index on cities.name for better performance
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Note: The new deals table structure doesn't have a departure_city_id column
-- so we don't need to update any foreign keys

-- Log the results
DO $$
DECLARE
  v_new_cities_count INTEGER;
  v_total_cities_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_cities_count FROM cities;
  RAISE NOTICE 'Total cities in database: %', v_total_cities_count;
  RAISE NOTICE 'Cities are now automatically added from deals';
END $$;