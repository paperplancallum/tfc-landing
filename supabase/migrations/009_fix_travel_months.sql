-- Fix travel_month for deals that have null values
UPDATE deals
SET travel_month = 'February 2025'
WHERE travel_month IS NULL 
  AND departure_city = 'London' 
  AND destination_city = 'Barcelona'
  AND price IN (49, 77);

UPDATE deals
SET travel_month = 'March 2025'
WHERE travel_month IS NULL 
  AND departure_city = 'London' 
  AND destination_city = 'Rome, Italy';

UPDATE deals
SET travel_month = 'February 2025'
WHERE travel_month IS NULL 
  AND departure_city = 'London' 
  AND destination_city = 'Amsterdam, Netherlands';

-- Set default travel months for any remaining null values
UPDATE deals
SET travel_month = 'March 2025'
WHERE travel_month IS NULL;