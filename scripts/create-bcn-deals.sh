#!/bin/bash

# Script to create example deals from Barcelona (BCN)

# Set your API key
API_KEY="Yaz5x8fSmkjvnp9Sl8T22KIy7BeWMw9vEPBW+Tj3u+E="

# Base URL - change to production when ready
# BASE_URL="http://localhost:3002"
BASE_URL="https://tfc-landing.vercel.app"

echo "Creating example deals from Barcelona (BCN)..."
echo "============================================="

# Deal 1: Barcelona to London
echo -e "\n1. BCN → LHR (London)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-001",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "LHR",
    "to_airport_name": "London Heathrow Airport",
    "to_airport_city": "London",
    "to_airport_country": "United Kingdom",
    "departure_date": "2025-02-15",
    "return_date": "2025-02-18",
    "trip_duration": 3,
    "deal_found_date": "2025-01-29",
    "price": 89,
    "currency": "EUR",
    "airline": "Vueling",
    "destination_city_image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"
  }' | jq '.'

sleep 1

# Deal 2: Barcelona to Paris
echo -e "\n\n2. BCN → CDG (Paris)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-002",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "CDG",
    "to_airport_name": "Charles de Gaulle Airport",
    "to_airport_city": "Paris",
    "to_airport_country": "France",
    "departure_date": "2025-03-10",
    "return_date": "2025-03-13",
    "trip_duration": 3,
    "deal_found_date": "2025-01-29",
    "price": 75,
    "currency": "EUR",
    "airline": "easyJet",
    "destination_city_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"
  }' | jq '.'

sleep 1

# Deal 3: Barcelona to Amsterdam
echo -e "\n\n3. BCN → AMS (Amsterdam)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-003",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "AMS",
    "to_airport_name": "Amsterdam Airport Schiphol",
    "to_airport_city": "Amsterdam",
    "to_airport_country": "Netherlands",
    "departure_date": "2025-04-05",
    "return_date": "2025-04-09",
    "trip_duration": 4,
    "deal_found_date": "2025-01-29",
    "price": 110,
    "currency": "EUR",
    "airline": "KLM",
    "destination_city_image": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800"
  }' | jq '.'

sleep 1

# Deal 4: Barcelona to Rome
echo -e "\n\n4. BCN → FCO (Rome)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-004",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "FCO",
    "to_airport_name": "Leonardo da Vinci-Fiumicino Airport",
    "to_airport_city": "Rome",
    "to_airport_country": "Italy",
    "departure_date": "2025-05-20",
    "return_date": "2025-05-24",
    "trip_duration": 4,
    "deal_found_date": "2025-01-29",
    "price": 95,
    "currency": "EUR",
    "airline": "Ryanair",
    "destination_city_image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"
  }' | jq '.'

sleep 1

# Deal 5: Barcelona to Berlin
echo -e "\n\n5. BCN → BER (Berlin)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-005",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "BER",
    "to_airport_name": "Berlin Brandenburg Airport",
    "to_airport_city": "Berlin",
    "to_airport_country": "Germany",
    "departure_date": "2025-03-22",
    "return_date": "2025-03-25",
    "trip_duration": 3,
    "deal_found_date": "2025-01-29",
    "price": 85,
    "currency": "EUR",
    "airline": "Lufthansa",
    "destination_city_image": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800"
  }' | jq '.'

sleep 1

# Deal 6: Barcelona to Lisbon
echo -e "\n\n6. BCN → LIS (Lisbon)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-006",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "LIS",
    "to_airport_name": "Lisbon Airport",
    "to_airport_city": "Lisbon",
    "to_airport_country": "Portugal",
    "departure_date": "2025-04-15",
    "return_date": "2025-04-18",
    "trip_duration": 3,
    "deal_found_date": "2025-01-29",
    "price": 65,
    "currency": "EUR",
    "airline": "TAP Air Portugal",
    "destination_city_image": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800"
  }' | jq '.'

sleep 1

# Deal 7: Barcelona to Vienna
echo -e "\n\n7. BCN → VIE (Vienna)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-007",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "VIE",
    "to_airport_name": "Vienna International Airport",
    "to_airport_city": "Vienna",
    "to_airport_country": "Austria",
    "departure_date": "2025-05-01",
    "return_date": "2025-05-05",
    "trip_duration": 4,
    "deal_found_date": "2025-01-29",
    "price": 120,
    "currency": "EUR",
    "airline": "Austrian Airlines",
    "destination_city_image": "https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=800"
  }' | jq '.'

sleep 1

# Deal 8: Barcelona to Prague
echo -e "\n\n8. BCN → PRG (Prague)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-008",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "PRG",
    "to_airport_name": "Václav Havel Airport Prague",
    "to_airport_city": "Prague",
    "to_airport_country": "Czech Republic",
    "departure_date": "2025-06-10",
    "return_date": "2025-06-14",
    "trip_duration": 4,
    "deal_found_date": "2025-01-29",
    "price": 105,
    "currency": "EUR",
    "airline": "Czech Airlines",
    "destination_city_image": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800"
  }' | jq '.'

sleep 1

# Deal 9: Barcelona to Copenhagen
echo -e "\n\n9. BCN → CPH (Copenhagen)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-009",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "CPH",
    "to_airport_name": "Copenhagen Airport",
    "to_airport_city": "Copenhagen",
    "to_airport_country": "Denmark",
    "departure_date": "2025-07-05",
    "return_date": "2025-07-09",
    "trip_duration": 4,
    "deal_found_date": "2025-01-29",
    "price": 135,
    "currency": "EUR",
    "airline": "SAS",
    "destination_city_image": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800"
  }' | jq '.'

sleep 1

# Deal 10: Barcelona to Athens
echo -e "\n\n10. BCN → ATH (Athens)"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "BCN-010",
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "ATH",
    "to_airport_name": "Athens International Airport",
    "to_airport_city": "Athens",
    "to_airport_country": "Greece",
    "departure_date": "2025-09-15",
    "return_date": "2025-09-22",
    "trip_duration": 7,
    "deal_found_date": "2025-01-29",
    "price": 155,
    "currency": "EUR",
    "airline": "Aegean Airlines",
    "destination_city_image": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800"
  }' | jq '.'

echo -e "\n\nAll deals created successfully!"
echo "Visit https://tfc-landing.vercel.app/deals to see them."