-- This migration populates the cities table with unique departure cities from deals

-- First, let's add common cities that might be missing
INSERT INTO cities (name, iata_code, timezone)
VALUES 
    ('Barcelona', 'BCN', 'Europe/Madrid'),
    ('Madrid', 'MAD', 'Europe/Madrid'),
    ('Paris', 'CDG', 'Europe/Paris'),
    ('Amsterdam', 'AMS', 'Europe/Amsterdam'),
    ('Rome', 'FCO', 'Europe/Rome'),
    ('Frankfurt', 'FRA', 'Europe/Berlin'),
    ('Munich', 'MUC', 'Europe/Berlin'),
    ('Berlin', 'BER', 'Europe/Berlin'),
    ('Dublin', 'DUB', 'Europe/Dublin'),
    ('Brussels', 'BRU', 'Europe/Brussels'),
    ('Vienna', 'VIE', 'Europe/Vienna'),
    ('Prague', 'PRG', 'Europe/Prague'),
    ('Athens', 'ATH', 'Europe/Athens'),
    ('Milan', 'MXP', 'Europe/Rome'),
    ('Venice', 'VCE', 'Europe/Rome'),
    ('Lisbon', 'LIS', 'Europe/Lisbon'),
    ('Copenhagen', 'CPH', 'Europe/Copenhagen'),
    ('Stockholm', 'ARN', 'Europe/Stockholm'),
    ('Oslo', 'OSL', 'Europe/Oslo'),
    ('Helsinki', 'HEL', 'Europe/Helsinki'),
    ('Warsaw', 'WAW', 'Europe/Warsaw'),
    ('Budapest', 'BUD', 'Europe/Budapest'),
    ('Zagreb', 'ZAG', 'Europe/Zagreb'),
    ('Zurich', 'ZRH', 'Europe/Zurich'),
    ('Geneva', 'GVA', 'Europe/Zurich')
ON CONFLICT (iata_code) DO NOTHING;

-- Common UK cities
INSERT INTO cities (name, iata_code, timezone)
VALUES 
    ('London', 'LHR', 'Europe/London'),
    ('Manchester', 'MAN', 'Europe/London'),
    ('Birmingham', 'BHX', 'Europe/London'),
    ('Edinburgh', 'EDI', 'Europe/London'),
    ('Glasgow', 'GLA', 'Europe/London'),
    ('Bristol', 'BRS', 'Europe/London'),
    ('Newcastle', 'NCL', 'Europe/London'),
    ('Belfast', 'BFS', 'Europe/London'),
    ('Leeds', 'LBA', 'Europe/London'),
    ('Liverpool', 'LPL', 'Europe/London')
ON CONFLICT (iata_code) DO NOTHING;

-- Note: The ProfileForm component will be updated to show cities from both
-- the cities table AND unique departure_city values from the deals table
-- to ensure all cities with available deals are selectable