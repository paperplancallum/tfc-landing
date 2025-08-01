import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testCitiesMigration() {
  console.log('Testing cities migration...\n')

  try {
    // 1. Get count of cities before
    const { count: citiesCountBefore } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true })
    
    console.log(`Cities count before migration: ${citiesCountBefore}`)

    // 2. Get unique departure cities from deals
    const { data: uniqueDepartureCities, error: departureCitiesError } = await supabase
      .from('deals')
      .select('departure_city')
      .not('departure_city', 'is', null)
      .order('departure_city')
    
    if (departureCitiesError) {
      throw departureCitiesError
    }

    const uniqueCities = [...new Set(uniqueDepartureCities?.map(d => d.departure_city) || [])]
    console.log(`\nUnique departure cities in deals: ${uniqueCities.length}`)
    console.log('Sample cities:', uniqueCities.slice(0, 10))

    // 3. Check which cities are missing from cities table
    const { data: existingCities } = await supabase
      .from('cities')
      .select('name')
    
    const existingCityNames = new Set(existingCities?.map(c => c.name) || [])
    const missingCities = uniqueCities.filter(city => !existingCityNames.has(city))
    
    console.log(`\nCities missing from cities table: ${missingCities.length}`)
    if (missingCities.length > 0) {
      console.log('Missing cities:', missingCities.slice(0, 10))
    }

    // 4. Test the trigger by inserting a test deal with a new city
    const testCityName = `Test City ${Date.now()}`
    console.log(`\nTesting trigger with new city: ${testCityName}`)
    
    const { error: insertError } = await supabase
      .from('deals')
      .insert({
        departure_city: testCityName,
        departure_airport: 'TST',
        destination_city: 'London',
        destination_airport: 'LHR',
        price: 100,
        currency: 'GBP',
        trip_length: 7,
        travel_month: 'December 2024',
        is_premium: false
      })
    
    if (insertError) {
      console.error('Error inserting test deal:', insertError)
    } else {
      // Check if the city was auto-added
      const { data: newCity } = await supabase
        .from('cities')
        .select('*')
        .eq('name', testCityName)
        .single()
      
      if (newCity) {
        console.log('✓ Trigger successfully added new city:', newCity)
        
        // Clean up test data
        await supabase.from('deals').delete().eq('departure_city', testCityName)
        await supabase.from('cities').delete().eq('id', newCity.id)
        console.log('✓ Test data cleaned up')
      } else {
        console.log('✗ Trigger did not add the new city')
      }
    }

    // 5. Get final count
    const { count: citiesCountAfter } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\nCities count after migration: ${citiesCountAfter}`)
    console.log(`New cities added: ${(citiesCountAfter || 0) - (citiesCountBefore || 0)}`)

    // 6. Verify users can now select any city with deals
    console.log('\nVerifying city selection options...')
    const { data: availableCities } = await supabase
      .from('cities')
      .select('id, name, iata_code')
      .order('name')
      .limit(5)
    
    console.log('Sample available cities for users:')
    availableCities?.forEach(city => {
      console.log(`  - ${city.name} (${city.iata_code})`)
    })

  } catch (error) {
    console.error('Error during migration test:', error)
  }
}

testCitiesMigration()