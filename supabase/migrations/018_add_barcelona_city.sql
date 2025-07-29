-- Add Barcelona to cities table if it doesn't exist
INSERT INTO cities (name, iata_code, timezone)
VALUES ('Barcelona', 'BCN', 'Europe/Madrid')
ON CONFLICT (iata_code) DO NOTHING;