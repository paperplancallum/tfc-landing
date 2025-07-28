-- Update existing deals with sample departure and return dates
UPDATE deals
SET 
  departure_dates = ARRAY[
    '2025-02-15',
    '2025-02-16',
    '2025-02-22',
    '2025-02-23'
  ],
  return_dates = ARRAY[
    '2025-02-18',
    '2025-02-19',
    '2025-02-25',
    '2025-02-26'
  ]
WHERE destination_city = 'Barcelona' AND departure_city = 'London';

-- Add dates for any other existing deals
UPDATE deals
SET 
  departure_dates = ARRAY[
    (CURRENT_DATE + INTERVAL '30 days')::text,
    (CURRENT_DATE + INTERVAL '31 days')::text,
    (CURRENT_DATE + INTERVAL '37 days')::text,
    (CURRENT_DATE + INTERVAL '38 days')::text
  ],
  return_dates = ARRAY[
    (CURRENT_DATE + INTERVAL '33 days')::text,
    (CURRENT_DATE + INTERVAL '34 days')::text,
    (CURRENT_DATE + INTERVAL '40 days')::text,
    (CURRENT_DATE + INTERVAL '41 days')::text
  ]
WHERE departure_dates IS NULL OR return_dates IS NULL;