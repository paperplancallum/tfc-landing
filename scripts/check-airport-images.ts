import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAirportImages() {
  // Check if column exists by querying a few airports
  const { data: airports, error } = await supabase
    .from('airports')
    .select('iata_code, city_image_url')
    .in('iata_code', ['LHR', 'JFK', 'LAX', 'CDG', 'NRT'])
    .limit(5);

  if (error) {
    console.error('Error querying airports:', error);
    return;
  }

  console.log('Sample airports:');
  airports?.forEach(airport => {
    console.log(`${airport.iata_code}: ${airport.city_image_url || 'NULL'}`);
  });

  // Count how many airports have city_image_url populated
  const { count: totalCount } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true });

  const { count: withImageCount } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true })
    .not('city_image_url', 'is', null);

  console.log(`\nTotal airports: ${totalCount}`);
  console.log(`Airports with city_image_url: ${withImageCount}`);

  // Check storage for uploaded images
  const { data: files, error: storageError } = await supabase.storage
    .from('city-images')
    .list('', { limit: 10 });

  if (!storageError && files) {
    console.log(`\nImages in storage: ${files.length}`);
    console.log('Sample files:', files.slice(0, 5).map(f => f.name).join(', '));
  }
}

checkAirportImages();