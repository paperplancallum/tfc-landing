-- Insert sample deals for London
INSERT INTO deals (departure_city_id, destination, price, currency, trip_length, travel_month, photo_url, is_premium, found_at)
VALUES 
-- Free deals (visible to all)
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Barcelona, Spain', 129, 'USD', 4, 'March 2024', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', false, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Amsterdam, Netherlands', 99, 'USD', 3, 'February 2024', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', false, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Rome, Italy', 189, 'USD', 5, 'April 2024', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', false, NOW()),
-- Premium deals
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Tokyo, Japan', 599, 'USD', 10, 'May 2024', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', true, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'New York, USA', 389, 'USD', 7, 'March 2024', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', true, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Dubai, UAE', 349, 'USD', 5, 'April 2024', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', true, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Sydney, Australia', 899, 'USD', 14, 'June 2024', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', true, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Bangkok, Thailand', 499, 'USD', 10, 'May 2024', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', true, NOW()),
((SELECT id FROM cities WHERE iata_code = 'LON'), 'Singapore', 549, 'USD', 8, 'April 2024', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', true, NOW());

-- Add some deals for other cities too
INSERT INTO deals (departure_city_id, destination, price, currency, trip_length, travel_month, photo_url, is_premium, found_at)
VALUES 
-- NYC deals
((SELECT id FROM cities WHERE iata_code = 'NYC'), 'Miami, USA', 89, 'USD', 4, 'March 2024', 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800', false, NOW()),
((SELECT id FROM cities WHERE iata_code = 'NYC'), 'Los Angeles, USA', 120, 'USD', 5, 'April 2024', 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=800', false, NOW()),
((SELECT id FROM cities WHERE iata_code = 'NYC'), 'London, UK', 299, 'USD', 7, 'May 2024', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', true, NOW());