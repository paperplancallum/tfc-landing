-- Migration to restructure deals table to mirror Airtable structure

-- First, create a new table with the Airtable structure
CREATE TABLE deals_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_number VARCHAR(50),
    autonumber INTEGER,
    from_airport_code VARCHAR(3) NOT NULL,
    from_airport_city VARCHAR(255),
    from_airport_country VARCHAR(255),
    to_airport_code VARCHAR(3) NOT NULL,
    to_airport_name VARCHAR(255),
    to_airport_city VARCHAR(255),
    to_airport_country VARCHAR(255),
    departure_date DATE,
    return_date DATE,
    trip_duration INTEGER,
    deal_found_date DATE DEFAULT CURRENT_DATE,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'GBP',
    airline VARCHAR(255),
    destination_city_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_deals_new_from_airport_code ON deals_new(from_airport_code);
CREATE INDEX idx_deals_new_to_airport_code ON deals_new(to_airport_code);
CREATE INDEX idx_deals_new_departure_date ON deals_new(departure_date);
CREATE INDEX idx_deals_new_deal_found_date ON deals_new(deal_found_date);
CREATE INDEX idx_deals_new_from_to_composite ON deals_new(from_airport_code, to_airport_code);

-- Migrate existing data from the old deals table to the new structure
INSERT INTO deals_new (
    from_airport_code,
    from_airport_city,
    to_airport_code,
    to_airport_city,
    departure_date,
    return_date,
    trip_duration,
    deal_found_date,
    price,
    currency,
    airline,
    destination_city_image,
    created_at
)
SELECT 
    departure_airport as from_airport_code,
    departure_city as from_airport_city,
    destination_airport as to_airport_code,
    destination_city as to_airport_city,
    -- Use the first date from departure_dates array if available
    CASE 
        WHEN departure_dates IS NOT NULL AND array_length(departure_dates, 1) > 0 
        THEN departure_dates[1]::DATE
        ELSE NULL
    END as departure_date,
    -- Use the first date from return_dates array if available
    CASE 
        WHEN return_dates IS NOT NULL AND array_length(return_dates, 1) > 0 
        THEN return_dates[1]::DATE
        ELSE NULL
    END as return_date,
    trip_length as trip_duration,
    found_at::DATE as deal_found_date,
    price,
    currency,
    airline,
    photo_url as destination_city_image,
    created_at
FROM deals
WHERE departure_airport IS NOT NULL 
  AND destination_airport IS NOT NULL;

-- Drop the old deals view if it exists
DROP VIEW IF EXISTS deals_view CASCADE;

-- Rename tables
ALTER TABLE deals RENAME TO deals_old;
ALTER TABLE deals_new RENAME TO deals;

-- Create a view for backward compatibility if needed
CREATE OR REPLACE VIEW deals_legacy AS
SELECT 
    id,
    from_airport_code as departure_airport,
    from_airport_city as departure_city,
    to_airport_code as destination_airport,
    to_airport_city as destination_city,
    price,
    currency,
    trip_duration as trip_length,
    EXTRACT(MONTH FROM departure_date)::TEXT || ' ' || EXTRACT(YEAR FROM departure_date)::TEXT as travel_month,
    destination_city_image as photo_url,
    deal_found_date as found_at,
    false as is_premium,
    NULL::TIMESTAMPTZ as expires_at,
    airline,
    NULL as booking_url,
    NULL as description,
    ARRAY[departure_date::TEXT] as departure_dates,
    ARRAY[return_date::TEXT] as return_dates,
    'round_trip' as deal_type,
    0 as stops,
    'economy' as cabin_class,
    created_at
FROM deals;

-- Enable RLS on the new deals table
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new table
CREATE POLICY "Anyone can view deals" ON deals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert deals" ON deals
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE deals IS 'Flight deals table mirroring Airtable structure';

-- Add comments to columns
COMMENT ON COLUMN deals.deal_number IS 'Unique deal identifier from Airtable';
COMMENT ON COLUMN deals.autonumber IS 'Auto-incremented number from Airtable';
COMMENT ON COLUMN deals.from_airport_code IS 'IATA code of departure airport';
COMMENT ON COLUMN deals.to_airport_code IS 'IATA code of destination airport';
COMMENT ON COLUMN deals.trip_duration IS 'Length of trip in days';
COMMENT ON COLUMN deals.destination_city_image IS 'URL to destination city image';