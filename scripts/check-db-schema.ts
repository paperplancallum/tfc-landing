import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('Checking database schema...\n')

  // Check airports table
  console.log('1. Checking airports table...')
  const { data: airports, error: airportsError } = await supabase
    .from('airports')
    .select('*')
    .limit(1)

  if (airportsError) {
    console.error('Error accessing airports table:', airportsError)
  } else {
    console.log('Airports table exists')
    if (airports && airports.length > 0) {
      console.log('Sample airport record:', airports[0])
    }
  }

  // Count airports
  const { count: airportCount } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true })
  console.log(`Total airports: ${airportCount || 0}\n`)

  // Check deals table
  console.log('2. Checking deals table...')
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .limit(1)

  if (dealsError) {
    console.error('Error accessing deals table:', dealsError)
  } else {
    console.log('Deals table exists')
    if (deals && deals.length > 0) {
      console.log('Sample deal record:', deals[0])
    }
  }

  // Check if deals_old exists
  console.log('\n3. Checking for deals_old table...')
  const { data: dealsOld, error: dealsOldError } = await supabase
    .from('deals_old')
    .select('*')
    .limit(1)

  if (dealsOldError) {
    console.log('deals_old table does not exist or is not accessible')
  } else {
    console.log('deals_old table exists')
  }

  // Check cities table
  console.log('\n4. Checking cities table...')
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('*')
    .limit(5)

  if (citiesError) {
    console.error('Error accessing cities table:', citiesError)
  } else {
    console.log('Cities table exists')
    console.log(`Sample cities:`, cities?.map(c => c.name).join(', '))
  }
}

checkSchema()