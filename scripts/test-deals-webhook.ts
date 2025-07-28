#!/usr/bin/env node

// Script to test the deals webhook endpoint
// Usage: npx tsx scripts/test-deals-webhook.ts

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/deals'
const WEBHOOK_SECRET = process.env.DEALS_WEBHOOK_SECRET || 'your-secret-key-here-change-this-in-production'

const sampleDeals = [
  {
    departure_airport: 'LHR',
    destination_airport: 'BCN',
    departure_city: 'London',
    destination_city: 'Barcelona',
    price: 49,
    currency: 'GBP',
    trip_length: 4,
    travel_month: 'February 2025',
    photo_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    is_premium: false,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    airline: 'Ryanair',
    booking_url: 'https://www.ryanair.com',
    description: 'Amazing deal to Barcelona! Direct flights available.',
    departure_dates: ['2025-02-10', '2025-02-11', '2025-02-12'],
    return_dates: ['2025-02-14', '2025-02-15', '2025-02-16'],
    deal_type: 'round_trip',
    stops: 0,
    cabin_class: 'economy'
  },
  {
    departure_airport: 'JFK',
    destination_airport: 'CDG',
    departure_city: 'New York',
    destination_city: 'Paris',
    price: 399,
    currency: 'USD',
    trip_length: 7,
    travel_month: 'March 2025',
    photo_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    is_premium: true,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    airline: 'Air France',
    booking_url: 'https://www.airfrance.com',
    description: 'Premium members only! Direct flights to the City of Light.',
    departure_dates: ['2025-03-15', '2025-03-16'],
    return_dates: ['2025-03-22', '2025-03-23'],
    deal_type: 'round_trip',
    stops: 0,
    cabin_class: 'economy'
  },
  {
    departure_airport: 'LAX',
    destination_airport: 'NRT',
    departure_city: 'Los Angeles',
    destination_city: 'Tokyo',
    price: 650,
    currency: 'USD',
    trip_length: 10,
    travel_month: 'April 2025',
    photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    is_premium: false,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    airline: 'ANA',
    booking_url: 'https://www.ana.co.jp',
    description: 'Cherry blossom season special! Experience Japan in full bloom.',
    departure_dates: ['2025-04-01', '2025-04-02', '2025-04-03'],
    return_dates: ['2025-04-11', '2025-04-12', '2025-04-13'],
    deal_type: 'round_trip',
    stops: 0,
    cabin_class: 'economy'
  },
  {
    departure_airport: 'MIA',
    destination_airport: 'CUN',
    departure_city: 'Miami',
    destination_city: 'Cancun',
    price: 199,
    currency: 'USD',
    trip_length: 5,
    travel_month: 'January 2025',
    photo_url: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800',
    is_premium: false,
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    airline: 'Southwest',
    booking_url: 'https://www.southwest.com',
    description: 'Winter escape to the Mexican Caribbean!',
    departure_dates: ['2025-01-20', '2025-01-21'],
    return_dates: ['2025-01-25', '2025-01-26'],
    deal_type: 'round_trip',
    stops: 0,
    cabin_class: 'economy'
  }
]

async function testWebhook() {
  try {
    console.log(`Sending ${sampleDeals.length} deals to ${WEBHOOK_URL}...`)
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({ deals: sampleDeals })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', result)
    } else {
      console.error('❌ Error:', response.status, result)
    }
  } catch (error) {
    console.error('❌ Request failed:', error)
  }
}

// Run the test
testWebhook()