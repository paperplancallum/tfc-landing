import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get unique departure cities from deals
    const { data: uniqueDepartureCities, error: departureCitiesError } = await supabase
      .from('deals')
      .select('from_airport_city')
      .not('from_airport_city', 'is', null)
      .not('from_airport_city', 'eq', '')
    
    if (departureCitiesError) {
      throw departureCitiesError
    }

    const uniqueCities = [...new Set(uniqueDepartureCities?.map(d => d.from_airport_city) || [])]
    
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