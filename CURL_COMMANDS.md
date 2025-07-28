# TFC Deal Management Commands

## 1. First, clear all existing deals:

```bash
curl -X DELETE 'https://tfc-landing.vercel.app/api/clear-deals' \
  -H 'X-Webhook-Secret: tfc-webhook-secret-2025'
```

## 2. Add London Deals:

```bash
curl -X POST 'https://tfc-landing.vercel.app/api/webhooks/deals' \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Secret: tfc-webhook-secret-2025' \
  -d '{
    "deals": [
      {
        "departure_airport": "LHR",
        "destination_airport": "BCN",
        "departure_city": "London",
        "destination_city": "Barcelona",
        "price": 49,
        "currency": "GBP",
        "trip_length": 3,
        "travel_month": "February 2025",
        "photo_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
        "is_premium": false,
        "airline": "Ryanair",
        "booking_url": "https://www.ryanair.com",
        "description": "Direct flight to Barcelona",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "LHR",
        "destination_airport": "BCN",
        "departure_city": "London",
        "destination_city": "Barcelona",
        "price": 89,
        "currency": "GBP",
        "trip_length": 4,
        "travel_month": "March 2025",
        "photo_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
        "is_premium": false,
        "airline": "British Airways",
        "booking_url": "https://www.britishairways.com",
        "description": "Non-stop flight with BA",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "LHR",
        "destination_airport": "AMS",
        "departure_city": "London",
        "destination_city": "Amsterdam",
        "price": 65,
        "currency": "GBP",
        "trip_length": 3,
        "travel_month": "February 2025",
        "photo_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800",
        "is_premium": false,
        "airline": "EasyJet",
        "booking_url": "https://www.easyjet.com",
        "description": "Weekend break to Amsterdam",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "LHR",
        "destination_airport": "CDG",
        "departure_city": "London",
        "destination_city": "Paris",
        "price": 79,
        "currency": "GBP",
        "trip_length": 3,
        "travel_month": "March 2025",
        "photo_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
        "is_premium": false,
        "airline": "Eurostar",
        "booking_url": "https://www.eurostar.com",
        "description": "Train to Paris city center",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "LHR",
        "destination_airport": "FCO",
        "departure_city": "London",
        "destination_city": "Rome",
        "price": 120,
        "currency": "GBP",
        "trip_length": 5,
        "travel_month": "April 2025",
        "photo_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
        "is_premium": false,
        "airline": "Alitalia",
        "booking_url": "https://www.ita-airways.com",
        "description": "Direct flight to Rome",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      }
    ]
  }'
```

## 3. Add Barcelona Deals:

```bash
curl -X POST 'https://tfc-landing.vercel.app/api/webhooks/deals' \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Secret: tfc-webhook-secret-2025' \
  -d '{
    "deals": [
      {
        "departure_airport": "BCN",
        "destination_airport": "LHR",
        "departure_city": "Barcelona",
        "destination_city": "London",
        "price": 55,
        "currency": "EUR",
        "trip_length": 3,
        "travel_month": "February 2025",
        "photo_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
        "is_premium": false,
        "airline": "Vueling",
        "booking_url": "https://www.vueling.com",
        "description": "Direct flight to London",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "BCN",
        "destination_airport": "CDG",
        "departure_city": "Barcelona",
        "destination_city": "Paris",
        "price": 45,
        "currency": "EUR",
        "trip_length": 3,
        "travel_month": "March 2025",
        "photo_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
        "is_premium": false,
        "airline": "Vueling",
        "booking_url": "https://www.vueling.com",
        "description": "Weekend in Paris",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "BCN",
        "destination_airport": "FCO",
        "departure_city": "Barcelona",
        "destination_city": "Rome",
        "price": 39,
        "currency": "EUR",
        "trip_length": 4,
        "travel_month": "February 2025",
        "photo_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
        "is_premium": false,
        "airline": "Ryanair",
        "booking_url": "https://www.ryanair.com",
        "description": "Budget flight to Rome",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "BCN",
        "destination_airport": "AMS",
        "departure_city": "Barcelona",
        "destination_city": "Amsterdam",
        "price": 69,
        "currency": "EUR",
        "trip_length": 3,
        "travel_month": "March 2025",
        "photo_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800",
        "is_premium": false,
        "airline": "KLM",
        "booking_url": "https://www.klm.com",
        "description": "Direct flight to Amsterdam",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "BCN",
        "destination_airport": "LIS",
        "departure_city": "Barcelona",
        "destination_city": "Lisbon",
        "price": 59,
        "currency": "EUR",
        "trip_length": 4,
        "travel_month": "April 2025",
        "photo_url": "https://images.unsplash.com/photo-1588940086836-36c7d89611c0?w=800",
        "is_premium": false,
        "airline": "TAP Portugal",
        "booking_url": "https://www.flytap.com",
        "description": "Explore Lisbon",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      }
    ]
  }'
```

## 4. Add Premium Deals (Optional):

```bash
curl -X POST 'https://tfc-landing.vercel.app/api/webhooks/deals' \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Secret: tfc-webhook-secret-2025' \
  -d '{
    "deals": [
      {
        "departure_airport": "LHR",
        "destination_airport": "JFK",
        "departure_city": "London",
        "destination_city": "New York",
        "price": 289,
        "currency": "GBP",
        "trip_length": 7,
        "travel_month": "March 2025",
        "photo_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
        "is_premium": true,
        "airline": "Virgin Atlantic",
        "booking_url": "https://www.virginatlantic.com",
        "description": "Direct flight to NYC",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      },
      {
        "departure_airport": "LHR",
        "destination_airport": "DXB",
        "departure_city": "London",
        "destination_city": "Dubai",
        "price": 399,
        "currency": "GBP",
        "trip_length": 6,
        "travel_month": "February 2025",
        "photo_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
        "is_premium": true,
        "airline": "Emirates",
        "booking_url": "https://www.emirates.com",
        "description": "Luxury flight to Dubai",
        "deal_type": "round_trip",
        "stops": 0,
        "cabin_class": "economy"
      }
    ]
  }'
```

## Verify Deals Were Added:

```bash
curl 'https://tfc-landing.vercel.app/api/debug/deals'
```