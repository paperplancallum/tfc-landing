import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyImport() {
  console.log('Verifying airport import with city and country data...\n')
  
  // Get a few sample airports from different countries
  const sampleCodes = ['LHR', 'JFK', 'CDG', 'NRT', 'SYD', 'DXB']
  
  for (const code of sampleCodes) {
    const { data, error } = await supabase
      .from('airports')
      .select('*')
      .eq('iata_code', code)
      .single()
    
    if (error) {
      console.error(`Error fetching ${code}:`, error)
      continue
    }
    
    if (data) {
      console.log(`${code}: ${data.name}`)
      console.log(`  City: ${data.city_name || 'NOT SET'}`)
      console.log(`  Country: ${data.country || 'NOT SET'}`)
      console.log(`  Primary: ${data.is_primary}`)
      console.log('')
    }
  }
  
  // Count airports by country
  console.log('Checking country distribution...')
  const { data: airports } = await supabase
    .from('airports')
    .select('country')
  
  if (airports) {
    const countryCounts: Record<string, number> = {}
    airports.forEach(airport => {
      const country = airport.country || 'Unknown'
      countryCounts[country] = (countryCounts[country] || 0) + 1
    })
    
    console.log('\nAirports by country:')
    Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`  ${country}: ${count} airports`)
      })
  }
  
  // Check for any airports missing city or country
  const { data: missingData, count: missingCount } = await supabase
    .from('airports')
    .select('*', { count: 'exact' })
    .or('city_name.is.null,country.is.null')
    .limit(5)
  
  if (missingCount && missingCount > 0) {
    console.log(`\nWarning: ${missingCount} airports missing city or country data`)
    console.log('Sample airports with missing data:')
    missingData?.forEach(airport => {
      console.log(`  ${airport.iata_code}: ${airport.name} - City: ${airport.city_name || 'MISSING'}, Country: ${airport.country || 'MISSING'}`)
    })
  } else {
    console.log('\n✅ All airports have city and country data!')
  }
}

verifyImport()