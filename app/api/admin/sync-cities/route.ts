import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Now use service role to sync cities
    const serviceSupabase = createServiceClient()
    
    // Get all unique departure cities from deals
    const { data: deals, error: dealsError } = await serviceSupabase
      .from('deals')
      .select('from_airport_city')
      .not('from_airport_city', 'is', null)
      .not('from_airport_city', 'eq', '')
    
    if (dealsError) {
      throw dealsError
    }
    
    const uniqueCities = [...new Set(deals?.map(d => d.from_airport_city) || [])]
    console.log(`Found ${uniqueCities.length} unique departure cities in deals`)
    
    // Get existing cities
    const { data: existingCities, error: citiesError } = await serviceSupabase
      .from('cities')
      .select('name, iata_code')
    
    if (citiesError) {
      throw citiesError
    }
    
    const existingCityNames = new Set(existingCities?.map(c => c.name) || [])
    const existingIataCodes = new Set(existingCities?.map(c => c.iata_code) || [])
    
    // Filter cities that need to be added
    const citiesToAdd = uniqueCities.filter(city => !existingCityNames.has(city))
    console.log(`Need to add ${citiesToAdd.length} new cities`)
    
    // Add missing cities
    const addedCities = []
    const errors = []
    
    for (const cityName of citiesToAdd) {
      try {
        // Generate IATA code
        let baseIata = cityName.length >= 3 
          ? cityName.replace(/\s+/g, '').substring(0, 3).toUpperCase()
          : cityName.replace(/\s+/g, '').toUpperCase().padEnd(3, 'X')
        
        let iataCode = baseIata
        let counter = 1
        
        // Make sure IATA code is unique
        while (existingIataCodes.has(iataCode)) {
          iataCode = baseIata + counter
          counter++
          if (counter > 99) {
            throw new Error(`Could not generate unique IATA code for ${cityName}`)
          }
        }
        
        // Add the city
        const { data, error } = await serviceSupabase
          .from('cities')
          .insert({
            name: cityName,
            iata_code: iataCode,
            timezone: 'UTC' // Default timezone
          })
          .select()
          .single()
        
        if (error) {
          errors.push({ city: cityName, error: error.message })
        } else {
          addedCities.push(data)
          existingIataCodes.add(iataCode) // Update our tracking set
        }
      } catch (error) {
        errors.push({ 
          city: cityName, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }
    
    // Get final count
    const { count: finalCount } = await serviceSupabase
      .from('cities')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      results: {
        total_deal_cities: uniqueCities.length,
        cities_before: existingCityNames.size,
        cities_added: addedCities.length,
        cities_after: finalCount,
        added_cities: addedCities.map(c => ({ name: c.name, iata_code: c.iata_code })),
        errors: errors
      }
    })
  } catch (error) {
    console.error('City sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync cities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}