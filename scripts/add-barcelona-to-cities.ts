import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addBarcelonaToCities() {
  try {
    // First check if Barcelona already exists
    const { data: existingCity, error: checkError } = await supabase
      .from('cities')
      .select('*')
      .eq('iata_code', 'BCN')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is expected if Barcelona doesn't exist
      throw checkError
    }

    if (existingCity) {
      console.log('Barcelona already exists in the cities table:', existingCity)
      return
    }

    // Add Barcelona if it doesn't exist
    const { data, error } = await supabase
      .from('cities')
      .insert({
        name: 'Barcelona',
        iata_code: 'BCN',
        timezone: 'Europe/Madrid'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log('Successfully added Barcelona to cities table:', data)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addBarcelonaToCities()