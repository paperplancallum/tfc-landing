import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import * as path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Running migration to add city_name and country fields...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '015_add_city_country_to_airports.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      // If the RPC function doesn't exist, try a different approach
      console.log('Note: exec_sql function not available, please run the migration manually through Supabase dashboard')
      console.log('\nMigration SQL:')
      console.log('------------------------')
      console.log(migrationSQL)
      console.log('------------------------')
      console.log('\nAlternatively, you can run: npx supabase db push')
    } else {
      console.log('Migration completed successfully!')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()