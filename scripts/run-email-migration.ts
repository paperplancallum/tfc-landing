import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running email preferences migration...');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '019_email_preferences.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('Error running migration:', error);
      
      // If exec_sql doesn't exist, try running the migration manually
      console.log('\nTrying alternative method...');
      console.log('\nPlease run this migration manually in your Supabase dashboard:');
      console.log('\n--- Copy everything below this line ---\n');
      console.log(migrationSQL);
      console.log('\n--- Copy everything above this line ---\n');
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();