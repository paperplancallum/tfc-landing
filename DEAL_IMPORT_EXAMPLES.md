# Deal Import Examples

This document shows how to import deals from Airtable to your TFC Landing database using the new `/api/deals/create` endpoint.

## Authentication

All requests require an API key. Set the `X-API-Key` header with your secret key.

```bash
API_KEY="your-secret-key-here"
```

## Method 1: JSON Body (Recommended)

This is the cleanest method for sending deal data.

```bash
curl -X POST 'https://tfc-landing.vercel.app/api/deals/create' \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "deal_number": "DEAL-1",
    "autonumber": 1,
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
  }'
```

## Method 2: URL Parameters

For simpler integrations, you can pass all parameters in the URL.

```bash
curl -X POST "https://tfc-landing.vercel.app/api/deals/create?\
from_airport_code=BCN&\
from_airport_city=Barcelona&\
from_airport_country=Spain&\
to_airport_code=LHR&\
to_airport_name=London%20Heathrow%20Airport&\
to_airport_city=London&\
to_airport_country=United%20Kingdom&\
departure_date=29/07/2025&\
return_date=31/07/2025&\
trip_duration=2&\
deal_found_date=29/07/2025&\
price=99&\
currency=GBP&\
airline=Ryanair&\
destination_city_image=https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800" \
  -H "X-API-Key: ${API_KEY}"
```

## Field Mapping from Airtable

| Airtable Field | API Parameter | Required | Example |
|----------------|---------------|----------|---------|
| Deal Number | deal_number | No | "DEAL-1" |
| Autonumber | autonumber | No | 1 |
| From (Airport Code) | from_airport_code | **Yes** | "BCN" |
| Airport City (from From) | from_airport_city | No | "Barcelona" |
| Airport Country (from From) | from_airport_country | No | "Spain" |
| To (Airport Code) | to_airport_code | **Yes** | "LHR" |
| Airport Name (from To) | to_airport_name | No | "London Heathrow Airport" |
| Airport City (from To) | to_airport_city | No | "London" |
| Airport Country (from To) | to_airport_country | No | "United Kingdom" |
| Departure Date | departure_date | No | "29/07/2025" or "2025-07-29" |
| Return Date | return_date | No | "31/07/2025" or "2025-07-31" |
| Trip Duration | trip_duration | No | 2 |
| Deal Found Date | deal_found_date | No | "29/07/2025" or "2025-07-29" |
| Price | price | No | 99 |
| Currency | currency | No | "GBP" (default: "GBP") |
| Airline | airline | No | "Ryanair" |
| Destination City Image | destination_city_image | No | "https://..." |

## Date Formats

The API accepts dates in two formats:
- **DD/MM/YYYY** (Airtable format): "29/07/2025"
- **YYYY-MM-DD** (ISO format): "2025-07-29"

## Minimal Example

The only required fields are the airport codes:

```bash
curl -X POST 'https://tfc-landing.vercel.app/api/deals/create' \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "from_airport_code": "BCN",
    "to_airport_code": "LHR"
  }'
```

## Response Format

### Success Response (201)
```json
{
  "success": true,
  "message": "Deal created successfully",
  "deal": {
    "id": "uuid-here",
    "deal_number": "DEAL-1",
    "route": "BCN-LHR",
    "price": 99,
    "currency": "GBP",
    "departure_date": "2025-07-29",
    "return_date": "2025-07-31"
  }
}
```

### Error Response (400/401/500)
```json
{
  "error": "Error message here",
  "details": "Additional details if available"
}
```

## Airtable Automation

To automatically send deals from Airtable:

1. Create an Automation in Airtable
2. Trigger: When record is created
3. Action: Send webhook
4. URL: `https://tfc-landing.vercel.app/api/deals/create`
5. Method: POST
6. Headers: 
   - `X-API-Key: your-secret-key`
   - `Content-Type: application/json`
7. Body: Map your Airtable fields to the JSON structure above

## Testing

Use the provided test script to verify your setup:

```bash
./scripts/test-single-deal.sh
```

## API Documentation

Visit the endpoint directly to see live documentation:

```bash
curl https://tfc-landing.vercel.app/api/deals/create
```