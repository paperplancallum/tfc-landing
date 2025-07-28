import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'lhr-bcn-28072025'
    
    const parts = slug.split('-')
    const [departureAirport, destinationAirport, dateStr] = parts
    
    // Parse date from DDMMYYYY format
    const day = dateStr.substring(0, 2)
    const month = dateStr.substring(2, 4)
    const year = dateStr.substring(4, 8)
    const searchDate = `${year}-${month}-${day}`
    
    const supabase = await createClient()
    
    // First, let's see all Barcelona deals from LHR
    const { data: allBarcelonaDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('departure_airport', 'LHR')
      .ilike('destination_city', '%Barcelona%')
    
    // Then try the exact query
    const { data: exactQuery, error } = await supabase
      .from('deals')
      .select('*')
      .eq('departure_airport', departureAirport.toUpperCase())
      .ilike('destination_city', '%Barcelona%')
      .gte('found_at', `${searchDate}T00:00:00`)
      .lte('found_at', `${searchDate}T23:59:59`)
    
    // Also check with different date formats
    const { data: allDeals } = await supabase
      .from('deals')
      .select('id, departure_airport, destination_city, found_at')
      .eq('departure_airport', 'LHR')
      .limit(10)
    
    return NextResponse.json({
      debug_info: {
        slug,
        parsed: { departureAirport, destinationAirport, dateStr },
        searchDate,
        dateRange: {
          from: `${searchDate}T00:00:00`,
          to: `${searchDate}T23:59:59`
        }
      },
      all_barcelona_deals: allBarcelonaDeals?.map(d => ({
        id: d.id,
        departure_airport: d.departure_airport,
        destination_city: d.destination_city,
        found_at: d.found_at,
        formatted_date: new Date(d.found_at).toISOString()
      })),
      exact_query_results: exactQuery,
      sample_deals: allDeals?.map(d => ({
        ...d,
        found_at_formatted: new Date(d.found_at).toISOString(),
        url_date: new Date(d.found_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        }).replace(/\//g, '')
      })),
      error: error?.message
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}