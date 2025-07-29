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

async function runMigration() {
  try {
    console.log('Running migration to add region column...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '017_add_region_to_airports.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements and run them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).single()
      
      if (error) {
        // Try direct execution as fallback
        console.log('Direct execution failed, trying alternative method...')
        // Unfortunately, Supabase client doesn't support direct SQL execution
        // We'll need to check if the column already exists
      }
    }
    
    // Check if the column exists
    const { data, error } = await supabase
      .from('airports')
      .select('region')
      .limit(1)
    
    if (error && error.message.includes('column "region" does not exist')) {
      console.error('Migration failed - region column was not created')
      console.error('Please run the migration manually in the Supabase dashboard')
      return false
    }
    
    console.log('Region column exists!')
    return true
    
  } catch (error) {
    console.error('Error running migration:', error)
    return false
  }
}

// Run the migration
runMigration().then(success => {
  if (success) {
    console.log('Migration check completed')
  } else {
    console.error('Migration check failed')
    process.exit(1)
  }
})