import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addColumns() {
  console.log('Adding city_name and country columns to airports table...\n')
  
  // Since we can't run DDL directly through the JS client, let's provide instructions
  console.log('Please run the following SQL in your Supabase SQL editor:')
  console.log('(Go to https://supabase.com/dashboard/project/tihoougxhpakomvxxlgl/sql/new)')
  console.log('\n--- SQL TO RUN ---\n')
  
  const sql = `-- Add city_name and country columns to airports table
ALTER TABLE airports 
ADD COLUMN IF NOT EXISTS city_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS country VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_airports_city_name ON airports(city_name);
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);`;
  
  console.log(sql)
  console.log('\n--- END SQL ---\n')
  
  console.log('After running the SQL above, we can re-import the airports with city and country data.')
  
  // Check if we can at least update existing records
  console.log('\nAlternatively, trying to check if columns were added...')
  const { data, error } = await supabase
    .from('airports')
    .select('*')
    .limit(1)
    .single()
    
  if (data && ('city_name' in data || 'country' in data)) {
    console.log('Columns appear to have been added!')
  }
}

addColumns()