import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, iata_code')
      .order('name')
    
    if (citiesError) {
      throw citiesError
    }
    
    // Get count of deals by departure city
    const { data: dealCities, error: dealsError } = await supabase
      .from('deals')
      .select('from_airport_city')
      .not('from_airport_city', 'is', null)
    
    if (dealsError) {
      throw dealsError
    }
    
    const uniqueDealCities = [...new Set(dealCities?.map(d => d.from_airport_city) || [])]
    
    return NextResponse.json({
      total_cities_in_table: cities?.length || 0,
      total_unique_deal_cities: uniqueDealCities.length,
      cities_list: cities || [],
      sample_deal_cities: uniqueDealCities.slice(0, 10),
      message: cities?.length === 3 ? 'Only initial cities exist. Migration has not run yet.' : 'Cities have been populated.'
    })
  } catch (error) {
    console.error('Check cities error:', error)
    return NextResponse.json({ 
      error: 'Failed to check cities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}