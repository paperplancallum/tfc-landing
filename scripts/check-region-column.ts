import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease ensure these are set in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRegionColumn() {
  try {
    console.log('Checking if region column exists...')
    
    // Try to select the region column
    const { data, error } = await supabase
      .from('airports')
      .select('id, city_name, region')
      .limit(5)
    
    if (error) {
      if (error.message.includes('column "region" does not exist')) {
        console.error('❌ Region column does not exist!')
        console.log('\nPlease run the following migration in your Supabase dashboard:')
        console.log('File: supabase/migrations/017_add_region_to_airports.sql')
        return false
      } else {
        console.error('Error checking column:', error)
        return false
      }
    }
    
    console.log('✅ Region column exists!')
    console.log('\nSample data:')
    data?.forEach(airport => {
      console.log(`- ${airport.city_name}: ${airport.region || 'Not set'}`)
    })
    
    // Count airports by region
    const { data: regionCounts, error: countError } = await supabase
      .from('airports')
      .select('region')
    
    if (!countError && regionCounts) {
      const counts: Record<string, number> = {}
      regionCounts.forEach(row => {
        const region = row.region || 'Not set'
        counts[region] = (counts[region] || 0) + 1
      })
      
      console.log('\nCurrent region distribution:')
      Object.entries(counts).forEach(([region, count]) => {
        console.log(`${region}: ${count} airports`)
      })
    }
    
    return true
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

// Run the check
checkRegionColumn()