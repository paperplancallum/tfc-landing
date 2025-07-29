import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// API key for authentication
const API_KEY = process.env.DEALS_API_KEY || process.env.DEALS_WEBHOOK_SECRET

interface DealData {
  deal_number?: string
  autonumber?: number
  from_airport_code: string
  from_airport_city?: string
  from_airport_country?: string
  to_airport_code: string
  to_airport_name?: string
  to_airport_city?: string
  to_airport_country?: string
  departure_date?: string
  return_date?: string
  trip_duration?: number
  deal_found_date?: string
  price?: number
  currency?: string
  airline?: string
  destination_city_image?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!API_KEY || apiKey !== API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get data from body or URL parameters
    let dealData: DealData
    
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      // JSON body
      dealData = await request.json()
    } else {
      // URL parameters or form data
      const searchParams = request.nextUrl.searchParams
      dealData = {
        deal_number: searchParams.get('deal_number') || undefined,
        autonumber: searchParams.get('autonumber') ? parseInt(searchParams.get('autonumber')!) : undefined,
        from_airport_code: searchParams.get('from_airport_code') || '',
        from_airport_city: searchParams.get('from_airport_city') || undefined,
        from_airport_country: searchParams.get('from_airport_country') || undefined,
        to_airport_code: searchParams.get('to_airport_code') || '',
        to_airport_name: searchParams.get('to_airport_name') || undefined,
        to_airport_city: searchParams.get('to_airport_city') || undefined,
        to_airport_country: searchParams.get('to_airport_country') || undefined,
        departure_date: searchParams.get('departure_date') || undefined,
        return_date: searchParams.get('return_date') || undefined,
        trip_duration: searchParams.get('trip_duration') ? parseInt(searchParams.get('trip_duration')!) : undefined,
        deal_found_date: searchParams.get('deal_found_date') || undefined,
        price: searchParams.get('price') ? parseFloat(searchParams.get('price')!) : undefined,
        currency: searchParams.get('currency') || 'GBP',
        airline: searchParams.get('airline') || undefined,
        destination_city_image: searchParams.get('destination_city_image') || undefined,
      }
    }

    // Validate required fields
    if (!dealData.from_airport_code || !dealData.to_airport_code) {
      return NextResponse.json(
        { error: 'Missing required fields: from_airport_code and to_airport_code are required' },
        { status: 400 }
      )
    }

    // Validate airport codes
    if (dealData.from_airport_code.length !== 3 || dealData.to_airport_code.length !== 3) {
      return NextResponse.json(
        { error: 'Airport codes must be exactly 3 characters' },
        { status: 400 }
      )
    }

    // Convert date formats from DD/MM/YYYY to YYYY-MM-DD if needed
    const convertDate = (dateStr?: string): string | undefined => {
      if (!dateStr) return undefined
      
      // Check if already in YYYY-MM-DD format
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr
      }
      
      // Convert from DD/MM/YYYY to YYYY-MM-DD
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [day, month, year] = parts
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      return dateStr
    }

    // Prepare data for insertion
    const insertData = {
      deal_number: dealData.deal_number,
      autonumber: dealData.autonumber,
      from_airport_code: dealData.from_airport_code.toUpperCase(),
      from_airport_city: dealData.from_airport_city,
      from_airport_country: dealData.from_airport_country,
      to_airport_code: dealData.to_airport_code.toUpperCase(),
      to_airport_name: dealData.to_airport_name,
      to_airport_city: dealData.to_airport_city,
      to_airport_country: dealData.to_airport_country,
      departure_date: convertDate(dealData.departure_date),
      return_date: convertDate(dealData.return_date),
      trip_duration: dealData.trip_duration,
      deal_found_date: convertDate(dealData.deal_found_date) || new Date().toISOString().split('T')[0],
      price: dealData.price,
      currency: dealData.currency || 'GBP',
      airline: dealData.airline,
      destination_city_image: dealData.destination_city_image,
    }

    // Create Supabase client
    const supabase = await createClient()

    // Insert the deal
    const { data, error } = await supabase
      .from('deals')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create deal', details: error.message },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Deal created successfully',
        deal: {
          id: data.id,
          deal_number: data.deal_number,
          route: `${data.from_airport_code}-${data.to_airport_code}`,
          price: data.price,
          currency: data.currency,
          departure_date: data.departure_date,
          return_date: data.return_date
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to show API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/deals/create',
    method: 'POST',
    authentication: 'X-API-Key header required',
    description: 'Create a single flight deal',
    required_fields: ['from_airport_code', 'to_airport_code'],
    optional_fields: [
      'deal_number',
      'autonumber',
      'from_airport_city',
      'from_airport_country',
      'to_airport_name',
      'to_airport_city',
      'to_airport_country',
      'departure_date',
      'return_date',
      'trip_duration',
      'deal_found_date',
      'price',
      'currency',
      'airline',
      'destination_city_image'
    ],
    date_format: 'YYYY-MM-DD or DD/MM/YYYY',
    example_curl: `curl -X POST 'https://tfc-landing.vercel.app/api/deals/create' \\
  -H 'X-API-Key: your-api-key' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "from_airport_code": "BCN",
    "from_airport_city": "Barcelona",
    "to_airport_code": "LHR",
    "to_airport_city": "London",
    "departure_date": "29/07/2025",
    "return_date": "31/07/2025",
    "trip_duration": 2,
    "price": 99,
    "currency": "GBP",
    "airline": "Ryanair"
  }'`,
    example_url_params: `curl -X POST 'https://tfc-landing.vercel.app/api/deals/create?from_airport_code=BCN&to_airport_code=LHR&price=99'`
  })
}