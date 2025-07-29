import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugUpdates() {
  // Test updating a single airport
  const testIata = 'LHR';
  const testUrl = `${supabaseUrl}/storage/v1/object/public/city-images/${testIata.toLowerCase()}.jpg`;
  
  console.log(`Testing update for ${testIata} with URL: ${testUrl}`);
  
  // First, check if LHR exists
  const { data: airport, error: selectError } = await supabase
    .from('airports')
    .select('*')
    .eq('iata_code', testIata)
    .single();
    
  if (selectError) {
    console.error('Error selecting airport:', selectError);
  } else {
    console.log('Found airport:', airport);
  }
  
  // Try to update
  const { data, error } = await supabase
    .from('airports')
    .update({ city_image_url: testUrl })
    .eq('iata_code', testIata)
    .select();
    
  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Update result:', data);
  }
  
  // Check if update worked
  const { data: afterUpdate } = await supabase
    .from('airports')
    .select('iata_code, city_image_url')
    .eq('iata_code', testIata)
    .single();
    
  console.log('After update:', afterUpdate);
  
  // List all unique IATA codes from airports table
  const { data: allAirports, error: allError } = await supabase
    .from('airports')
    .select('iata_code')
    .order('iata_code');
    
  if (!allError && allAirports) {
    console.log(`\nTotal unique IATA codes in airports table: ${allAirports.length}`);
    console.log('First 10:', allAirports.slice(0, 10).map(a => a.iata_code).join(', '));
  }
}

debugUpdates();