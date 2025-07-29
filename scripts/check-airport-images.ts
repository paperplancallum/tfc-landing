import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAirportImages() {
  // Check specific airports including FNC and BER
  const airports = ['FNC', 'BER', 'ZRH', 'BCN', 'GVA', 'LHR', 'JFK'];
  
  console.log('Checking specific airports:');
  for (const code of airports) {
    const { data } = await supabase
      .from('airports')
      .select('iata_code, city_name, city_image_url')
      .eq('iata_code', code)
      .single();
      
    console.log(`${code} (${data?.city_name || 'Unknown'}): ${data?.city_image_url || 'NO IMAGE'}`);
  }
  
  // Check how many airports have images
  const { count: withImages } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true })
    .not('city_image_url', 'is', null);
    
  const { count: total } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\nAirports with images: ${withImages}/${total}`);
  
  // Check the BER -> FNC deal
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', 'BER')
    .eq('to_airport_code', 'FNC')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (deal) {
    console.log('\nBER -> FNC deal found:');
    console.log('  to_airport_city:', deal.to_airport_city);
    console.log('  destination_city_image in deal:', deal.destination_city_image || 'NONE');
  } else {
    console.log('\nNo BER -> FNC deal found');
  }
  
  // Check if there's any deal with destination_city_image
  const { data: dealsWithImages } = await supabase
    .from('deals')
    .select('from_airport_code, to_airport_code, destination_city_image')
    .not('destination_city_image', 'is', null)
    .limit(5);
    
  console.log('\nDeals with destination_city_image:');
  dealsWithImages?.forEach(d => {
    console.log(`  ${d.from_airport_code} -> ${d.to_airport_code}: ${d.destination_city_image}`);
  });
}

checkAirportImages();