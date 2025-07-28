-- Create airports table
CREATE TABLE IF NOT EXISTS airports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  iata_code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_airports_city_id ON airports(city_id);
CREATE INDEX idx_airports_iata_code ON airports(iata_code);

-- Update deals table to reference airports instead of cities
ALTER TABLE deals 
ADD COLUMN departure_airport_id UUID REFERENCES airports(id);

-- Migrate existing data
-- First, insert airports based on existing cities
INSERT INTO airports (city_id, iata_code, name, is_primary) VALUES
-- London
((SELECT id FROM cities WHERE iata_code = 'LON'), 'LHR', 'London Heathrow', true),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'LGW', 'London Gatwick', false),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'STN', 'London Stansted', false),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'LTN', 'London Luton', false),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'LCY', 'London City', false),

-- New York
((SELECT id FROM cities WHERE name = 'New York'), 'JFK', 'John F. Kennedy International', true),
((SELECT id FROM cities WHERE name = 'New York'), 'LGA', 'LaGuardia', false),
((SELECT id FROM cities WHERE name = 'New York'), 'EWR', 'Newark Liberty International', false),

-- Los Angeles
((SELECT id FROM cities WHERE iata_code = 'LAX'), 'LAX', 'Los Angeles International', true),
((SELECT id FROM cities WHERE iata_code = 'LAX'), 'BUR', 'Hollywood Burbank', false),
((SELECT id FROM cities WHERE iata_code = 'LAX'), 'LGB', 'Long Beach', false),
((SELECT id FROM cities WHERE iata_code = 'LAX'), 'SNA', 'John Wayne', false),

-- Miami
((SELECT id FROM cities WHERE iata_code = 'MIA'), 'MIA', 'Miami International', true),
((SELECT id FROM cities WHERE iata_code = 'MIA'), 'FLL', 'Fort Lauderdale-Hollywood International', false),
((SELECT id FROM cities WHERE iata_code = 'MIA'), 'PBI', 'Palm Beach International', false);

-- Update existing deals to use the primary airport for each city
UPDATE deals d
SET departure_airport_id = (
  SELECT a.id 
  FROM airports a 
  WHERE a.city_id = d.departure_city_id 
  AND a.is_primary = true
  LIMIT 1
)
WHERE d.departure_airport_id IS NULL;

-- Update the RLS policies for airports table
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

-- Everyone can read airports
CREATE POLICY "Anyone can view airports" ON airports
FOR SELECT USING (true);

-- Add function to get all airports for a city
CREATE OR REPLACE FUNCTION get_city_airports(city_name_param TEXT)
RETURNS TABLE (
  airport_id UUID,
  airport_code VARCHAR(3),
  airport_name TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.iata_code,
    a.name,
    a.is_primary
  FROM airports a
  JOIN cities c ON a.city_id = c.id
  WHERE LOWER(REPLACE(c.name, ' ', '-')) = LOWER(city_name_param);
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for airports
CREATE TRIGGER update_airports_updated_at
BEFORE UPDATE ON airports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();