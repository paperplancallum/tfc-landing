-- First, find the London city ID
WITH london_city AS (
  SELECT id FROM cities WHERE name = 'London' LIMIT 1
)

-- Insert test deals for London
INSERT INTO deals (
  departure_city_id,
  departure_city,
  departure_airport,
  destination_city,
  destination_airport,
  destination,
  price,
  currency,
  trip_length,
  travel_month,
  is_premium,
  photo_url,
  found_at,
  airline,
  deal_type,
  stops,
  cabin_class,
  booking_url
)
SELECT 
  london_city.id,
  departure_city,
  departure_airport,
  destination_city,
  destination_airport,
  destination,
  price,
  currency,
  trip_length,
  travel_month,
  is_premium,
  photo_url,
  found_at,
  airline,
  deal_type,
  stops,
  cabin_class,
  booking_url
FROM london_city, (VALUES
  -- Free deals
  ('London', 'LHR', 'Barcelona', 'BCN', 'Spain', 89, 'GBP', 4, 'February 2025', false, 
   'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', NOW(), 'Ryanair', 
   'round_trip', 0, 'economy', 'https://example.com/barcelona-deal'),
  
  ('London', 'LGW', 'Rome', 'FCO', 'Italy', 125, 'GBP', 3, 'March 2025', false,
   'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', NOW(), 'EasyJet',
   'round_trip', 0, 'economy', 'https://example.com/rome-deal'),
  
  ('London', 'STN', 'Amsterdam', 'AMS', 'Netherlands', 65, 'GBP', 2, 'January 2025', false,
   'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', NOW(), 'Ryanair',
   'round_trip', 0, 'economy', 'https://example.com/amsterdam-deal'),
  
  -- Premium deals
  ('London', 'LHR', 'New York', 'JFK', 'USA', 299, 'GBP', 7, 'April 2025', true,
   'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800', NOW(), 'British Airways',
   'round_trip', 0, 'economy', 'https://example.com/nyc-deal'),
  
  ('London', 'LHR', 'Tokyo', 'NRT', 'Japan', 499, 'GBP', 10, 'May 2025', true,
   'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', NOW(), 'JAL',
   'round_trip', 0, 'economy', 'https://example.com/tokyo-deal'),
  
  ('London', 'LHR', 'Dubai', 'DXB', 'UAE', 379, 'GBP', 5, 'March 2025', true,
   'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', NOW(), 'Emirates',
   'round_trip', 0, 'economy', 'https://example.com/dubai-deal')
) AS v(
  departure_city,
  departure_airport,
  destination_city,
  destination_airport,
  destination,
  price,
  currency,
  trip_length,
  travel_month,
  is_premium,
  photo_url,
  found_at,
  airline,
  deal_type,
  stops,
  cabin_class,
  booking_url
);

-- Verify the inserted deals
SELECT 
  departure_city,
  destination_city,
  price,
  currency,
  is_premium,
  travel_month
FROM deals
WHERE departure_city = 'London'
ORDER BY created_at DESC
LIMIT 10;