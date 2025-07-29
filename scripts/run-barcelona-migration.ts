import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addBarcelona() {
  try {
    console.log('Checking if Barcelona already exists...')
    
    // Check if Barcelona already exists
    const { data: existing, error: checkError } = await supabase
      .from('cities')
      .select('*')
      .eq('iata_code', 'BCN')
      .single()
    
    if (existing) {
      console.log('Barcelona already exists in the cities table:', existing)
      return true
    }
    
    console.log('Adding Barcelona to cities table...')
    
    // Add Barcelona
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
      console.error('Error adding Barcelona:', error)
      return false
    }
    
    console.log('Successfully added Barcelona:', data)
    return true
    
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

// Run the migration
addBarcelona().then(success => {
  if (success) {
    console.log('Barcelona is now available in the cities table')
  } else {
    console.error('Failed to add Barcelona')
    process.exit(1)
  }
})