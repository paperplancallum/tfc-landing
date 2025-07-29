#!/bin/bash

# Test script for creating a single deal via the new API endpoint

# Set your API key (use the same as DEALS_WEBHOOK_SECRET in your .env)
API_KEY="Yaz5x8fSmkjvnp9Sl8T22KIy7BeWMw9vEPBW+Tj3u+E="

# Base URL - change to production URL when ready
BASE_URL="http://localhost:3002"
# BASE_URL="https://tfc-landing.vercel.app"

echo "Testing deal creation endpoint..."
echo "================================"

# Test 1: JSON body format
echo -e "\nTest 1: Creating deal with JSON body"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "DEAL-TEST-1",
    "autonumber": 999,
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "from_airport_country": "Spain",
    "to_airport_code": "LHR",
    "to_airport_name": "London Heathrow Airport",
    "to_airport_city": "London",
    "to_airport_country": "United Kingdom",
    "departure_date": "29/07/2025",
    "return_date": "31/07/2025",
    "trip_duration": 2,
    "deal_found_date": "29/07/2025",
    "price": 99,
    "currency": "GBP",
    "airline": "Ryanair",
    "destination_city_image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"
  }' | jq '.'

echo -e "\n\nTest 2: Creating deal with URL parameters"
curl -X POST "${BASE_URL}/api/deals/create?from_airport_code=MAD&from_airport_city=Madrid&to_airport_code=CDG&to_airport_city=Paris&price=79&currency=EUR&departure_date=2025-08-15&return_date=2025-08-18&trip_duration=3&airline=Iberia" \
  -H "X-API-Key: ${API_KEY}" | jq '.'

echo -e "\n\nTest 3: Testing validation - missing required fields"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 100
  }' | jq '.'

echo -e "\n\nTest 4: Testing authentication - no API key"
curl -X POST "${BASE_URL}/api/deals/create" \
  -H "Content-Type: application/json" \
  -d '{
    "from_airport_code": "BCN",
    "to_airport_code": "MAD"
  }' | jq '.'

echo -e "\n\nDone!"