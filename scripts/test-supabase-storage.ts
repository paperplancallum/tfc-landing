import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  console.log('Testing Supabase storage...');
  
  // List buckets (this might fail with anon key)
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.log('Cannot list buckets with anon key (this is normal)');
  } else {
    console.log('Available buckets:', buckets?.map(b => b.name));
  }
  
  // Test if we can access the city-images bucket
  const { data: files, error: filesError } = await supabase.storage
    .from('city-images')
    .list('', { limit: 1 });
    
  if (filesError) {
    console.error('Error accessing city-images bucket:', filesError);
    console.log('\nPlease create a "city-images" bucket in Supabase Storage with:');
    console.log('1. Go to Storage in your Supabase dashboard');
    console.log('2. Create a new bucket named "city-images"');
    console.log('3. Set it as PUBLIC');
  } else {
    console.log('✓ Successfully accessed city-images bucket');
    console.log('Files in bucket:', files?.length || 0);
  }
  
  // Test database connection
  const { data: airports, error: dbError } = await supabase
    .from('airports')
    .select('iata_code')
    .limit(1);
    
  if (dbError) {
    console.error('Error accessing airports table:', dbError);
  } else {
    console.log('✓ Successfully accessed airports table');
  }
}

testStorage();