import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get unique departure cities from deals
    const { data: uniqueDepartureCities, error: departureCitiesError } = await supabase
      .from('deals')
      .select('departure_city')
      .not('departure_city', 'is', null)
      .not('departure_city', 'eq', '')
    
    if (departureCitiesError) {
      throw departureCitiesError
    }

    const uniqueCities = [...new Set(uniqueDepartureCities?.map(d => d.departure_city) || [])]
    
    // Get existing cities
    const { data: existingCities } = await supabase
      .from('cities')
      .select('name')
    
    const existingCityNames = new Set(existingCities?.map(c => c.name) || [])
    const missingCities = uniqueCities.filter(city => !existingCityNames.has(city))
    
    // Sample what would be added
    const sampleMissing = missingCities.slice(0, 10)
    
    return NextResponse.json({
      total_deal_cities: uniqueCities.length,
      existing_cities: existingCityNames.size,
      missing_cities: missingCities.length,
      sample_missing: sampleMissing,
      sample_existing: uniqueCities.filter(city => existingCityNames.has(city)).slice(0, 5),
      message: `Migration would add ${missingCities.length} new cities to the cities table`
    })
  } catch (error) {
    console.error('Cities sync test error:', error)
    return NextResponse.json({ 
      error: 'Failed to test cities sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}