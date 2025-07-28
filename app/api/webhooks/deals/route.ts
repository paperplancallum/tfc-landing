import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Validate webhook secret
const WEBHOOK_SECRET = process.env.DEALS_WEBHOOK_SECRET

interface Deal {
  departure_airport: string
  destination_airport: string
  departure_city: string
  destination_city: string
  price: number
  currency?: string
  trip_length: number
  travel_month: string
  photo_url?: string
  is_premium?: boolean
  expires_at?: string
  airline?: string
  booking_url?: string
  description?: string
  departure_dates?: string[]
  return_dates?: string[]
  deal_type?: 'round_trip' | 'one_way' | 'multi_city'
  stops?: number
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first'
}

interface DealsPayload {
  deals: Deal[]
}

export async function POST(request: NextRequest) {
  try {
    // Check webhook secret
    const authHeader = request.headers.get('x-webhook-secret')
    if (!WEBHOOK_SECRET || authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: DealsPayload = await request.json()
    
    if (!body.deals || !Array.isArray(body.deals)) {
      return NextResponse.json(
        { error: 'Invalid payload: deals array required' },
        { status: 400 }
      )
    }

    // Validate deals
    const validationErrors: string[] = []
    body.deals.forEach((deal, index) => {
      if (!deal.departure_airport || deal.departure_airport.length !== 3) {
        validationErrors.push(`Deal ${index}: Invalid departure_airport`)
      }
      if (!deal.destination_airport || deal.destination_airport.length !== 3) {
        validationErrors.push(`Deal ${index}: Invalid destination_airport`)
      }
      if (!deal.departure_city) {
        validationErrors.push(`Deal ${index}: Missing departure_city`)
      }
      if (!deal.destination_city) {
        validationErrors.push(`Deal ${index}: Missing destination_city`)
      }
      if (typeof deal.price !== 'number' || deal.price <= 0) {
        validationErrors.push(`Deal ${index}: Invalid price`)
      }
      if (typeof deal.trip_length !== 'number' || deal.trip_length <= 0) {
        validationErrors.push(`Deal ${index}: Invalid trip_length`)
      }
      if (!deal.travel_month) {
        validationErrors.push(`Deal ${index}: Missing travel_month`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      )
    }

    // Create Supabase client with service role to bypass RLS
    // In production, you should use SUPABASE_SERVICE_ROLE_KEY
    const supabase = await createClient()

    // Insert deals
    const dealsToInsert = body.deals.map(deal => ({
      departure_airport: deal.departure_airport.toUpperCase(),
      destination_airport: deal.destination_airport.toUpperCase(),
      departure_city: deal.departure_city,
      destination_city: deal.destination_city,
      // Remove destination field as it's no longer needed
      destination: deal.destination_city, // Keep for backward compatibility
      price: deal.price,
      currency: deal.currency || 'GBP',
      trip_length: deal.trip_length,
      travel_month: deal.travel_month,
      photo_url: deal.photo_url || null,
      is_premium: deal.is_premium || false,
      expires_at: deal.expires_at || null,
      airline: deal.airline || null,
      booking_url: deal.booking_url || null,
      description: deal.description || null,
      departure_dates: deal.departure_dates || null,
      return_dates: deal.return_dates || null,
      deal_type: deal.deal_type || 'round_trip',
      stops: deal.stops || 0,
      cabin_class: deal.cabin_class || 'economy',
    }))

    const { data, error } = await supabase
      .from('deals')
      .insert(dealsToInsert)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to insert deals', details: error.message },
        { status: 500 }
      )
    }

    // Return success with created deal IDs
    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully added ${data.length} deals`,
        deals: data.map(d => ({ 
          id: d.id, 
          departure: `${d.departure_airport}-${d.destination_airport}`,
          price: d.price 
        }))
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/deals',
    method: 'POST',
    authentication: 'X-Webhook-Secret header required',
    payload: {
      deals: [
        {
          departure_airport: 'LHR',
          destination_airport: 'BCN',
          departure_city: 'London',
          destination_city: 'Barcelona',
          price: 49,
          currency: 'GBP',
          trip_length: 3,
          travel_month: 'January 2025',
          photo_url: 'https://example.com/barcelona.jpg',
          is_premium: false,
          expires_at: '2025-01-15T00:00:00Z',
          airline: 'Ryanair',
          booking_url: 'https://example.com/book',
          description: 'Direct flight deal',
          departure_dates: ['2025-01-10', '2025-01-11', '2025-01-12'],
          return_dates: ['2025-01-13', '2025-01-14', '2025-01-15'],
          deal_type: 'round_trip',
          stops: 0,
          cabin_class: 'economy'
        }
      ]
    }
  })
}