-- Update deals table to use airport codes directly
-- This migration updates the deals table to store airport codes and city names directly
-- instead of relying on foreign keys

-- Add new columns for airport codes and city names
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS departure_airport VARCHAR(3),
ADD COLUMN IF NOT EXISTS destination_airport VARCHAR(3),
ADD COLUMN IF NOT EXISTS departure_city VARCHAR(255),
ADD COLUMN IF NOT EXISTS destination_city VARCHAR(255);

-- Update existing data by joining with airports and cities tables
UPDATE deals d
SET 
  departure_airport = a.iata_code,
  departure_city = c.name,
  -- For destination, we'll use the existing destination field as city name
  -- and default to a major airport code (this will need to be updated with real data)
  destination_city = d.destination,
  destination_airport = CASE 
    WHEN LOWER(d.destination) LIKE '%barcelona%' THEN 'BCN'
    WHEN LOWER(d.destination) LIKE '%paris%' THEN 'CDG'
    WHEN LOWER(d.destination) LIKE '%amsterdam%' THEN 'AMS'
    WHEN LOWER(d.destination) LIKE '%rome%' THEN 'FCO'
    WHEN LOWER(d.destination) LIKE '%madrid%' THEN 'MAD'
    WHEN LOWER(d.destination) LIKE '%lisbon%' THEN 'LIS'
    WHEN LOWER(d.destination) LIKE '%berlin%' THEN 'BER'
    WHEN LOWER(d.destination) LIKE '%dublin%' THEN 'DUB'
    WHEN LOWER(d.destination) LIKE '%vienna%' THEN 'VIE'
    WHEN LOWER(d.destination) LIKE '%prague%' THEN 'PRG'
    ELSE 'XXX' -- Unknown, will need to be updated
  END
FROM airports a
JOIN cities c ON a.city_id = c.id
WHERE d.departure_airport_id = a.id;

-- For deals without departure_airport_id, use the city's primary airport
UPDATE deals d
SET 
  departure_airport = COALESCE(
    (SELECT a.iata_code 
     FROM airports a 
     JOIN cities c ON a.city_id = c.id
     WHERE c.id = d.departure_city_id AND a.is_primary = true
     LIMIT 1),
    'LHR' -- Default to London Heathrow if no match
  ),
  departure_city = COALESCE(
    (SELECT c.name 
     FROM cities c 
     WHERE c.id = d.departure_city_id),
    'London' -- Default city
  )
WHERE d.departure_airport IS NULL;

-- Set default values for any remaining nulls
UPDATE deals 
SET 
  destination_city = COALESCE(destination_city, destination),
  destination_airport = COALESCE(destination_airport, 'XXX')
WHERE destination_city IS NULL OR destination_airport IS NULL;

-- Make new columns NOT NULL after data migration
ALTER TABLE deals
ALTER COLUMN departure_airport SET NOT NULL,
ALTER COLUMN destination_airport SET NOT NULL,
ALTER COLUMN departure_city SET NOT NULL,
ALTER COLUMN destination_city SET NOT NULL;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_deals_departure_airport ON deals(departure_airport);
CREATE INDEX IF NOT EXISTS idx_deals_destination_airport ON deals(destination_airport);
CREATE INDEX IF NOT EXISTS idx_deals_departure_city ON deals(departure_city);
CREATE INDEX IF NOT EXISTS idx_deals_destination_city ON deals(destination_city);

-- Add additional columns for enhanced deal information
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS airline VARCHAR(255),
ADD COLUMN IF NOT EXISTS booking_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS departure_dates TEXT[], -- Array of possible departure dates
ADD COLUMN IF NOT EXISTS return_dates TEXT[],    -- Array of possible return dates
ADD COLUMN IF NOT EXISTS deal_type VARCHAR(50) DEFAULT 'round_trip', -- round_trip, one_way, multi_city
ADD COLUMN IF NOT EXISTS stops INTEGER DEFAULT 0,  -- Number of stops (0 = direct)
ADD COLUMN IF NOT EXISTS cabin_class VARCHAR(50) DEFAULT 'economy'; -- economy, premium_economy, business, first

-- Create a view for easy deal querying with all relevant information
CREATE OR REPLACE VIEW deals_view AS
SELECT 
  d.*,
  -- Calculate if deal is still valid
  CASE 
    WHEN d.expires_at IS NULL THEN true
    WHEN d.expires_at > NOW() THEN true
    ELSE false
  END as is_active,
  -- Calculate days until expiration
  CASE 
    WHEN d.expires_at IS NULL THEN NULL
    ELSE EXTRACT(DAY FROM (d.expires_at - NOW()))::INTEGER
  END as days_until_expiry
FROM deals d;

-- Update RLS policies to use the new view
CREATE POLICY "Anyone can view non-premium deals view" ON deals
  FOR SELECT USING (is_premium = false);

CREATE POLICY "Premium users can view all deals view" ON deals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.plan = 'premium'
    )
  );

-- Note: Old columns (departure_city_id, departure_airport_id, destination) are kept for now
-- They can be dropped in a future migration after verifying all data is migrated correctly
-- and all application code is updated to use the new columns