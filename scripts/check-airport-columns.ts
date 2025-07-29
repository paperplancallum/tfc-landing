import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
  console.log('Checking airport table structure...\n')
  
  // Get one airport to see its structure
  const { data, error } = await supabase
    .from('airports')
    .select('*')
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Current airport columns:')
  console.log(Object.keys(data || {}))
  console.log('\nSample data:')
  console.log(data)
  
  // Check if city_name and country columns exist
  const hasCityName = data && 'city_name' in data
  const hasCountry = data && 'country' in data
  
  console.log(`\nHas city_name column: ${hasCityName}`)
  console.log(`Has country column: ${hasCountry}`)
  
  if (!hasCityName || !hasCountry) {
    console.log('\nMissing columns need to be added. Please run the migration.')
  }
}

checkColumns()