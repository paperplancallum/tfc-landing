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

async function debugDeal() {
  // Parse the slug: ber-fnc-29072025
  const slug = 'ber-fnc-29072025';
  const parts = slug.split('-');
  const [departureAirport, destinationAirport, dateStr] = parts;
  
  // Parse date
  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  const year = dateStr.substring(4, 8);
  const searchDate = `${year}-${month}-${day}`;
  
  console.log('Parsed from URL:');
  console.log(`  Departure: ${departureAirport.toUpperCase()}`);
  console.log(`  Destination: ${destinationAirport.toUpperCase()}`);
  console.log(`  Date: ${searchDate}`);
  
  // Query deals
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', departureAirport.toUpperCase())
    .eq('to_airport_code', destinationAirport.toUpperCase())
    .gte('deal_found_date', searchDate)
    .lte('deal_found_date', searchDate)
    .order('created_at', { ascending: true });
    
  console.log(`\nFound ${deals?.length || 0} matching deals`);
  
  if (deals && deals.length > 0) {
    const deal = deals[0];
    console.log('\nDeal details:');
    console.log(`  ID: ${deal.id}`);
    console.log(`  Route: ${deal.from_airport_code} (${deal.from_airport_city}) → ${deal.to_airport_code} (${deal.to_airport_city})`);
    console.log(`  Price: ${deal.currency}${deal.price}`);
    console.log(`  Found date: ${deal.deal_found_date}`);
    console.log(`  Destination image in deal: ${deal.destination_city_image || 'NONE'}`);
    
    // Check airport image
    const { data: airportData } = await supabase
      .from('airports')
      .select('city_image_url, city_name')
      .eq('iata_code', deal.to_airport_code)
      .single();
      
    console.log(`\nDestination airport (${deal.to_airport_code}):`);
    console.log(`  City: ${airportData?.city_name}`);
    console.log(`  Image URL: ${airportData?.city_image_url || 'NONE'}`);
    
    // Check if image actually exists
    if (airportData?.city_image_url) {
      // Extract the file name from the URL
      const urlParts = airportData.city_image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      console.log(`\nChecking if image file '${fileName}' exists in storage...`);
      
      const { data, error } = await supabase.storage
        .from('city-images')
        .download(fileName);
        
      if (!error && data) {
        console.log(`  ✓ Image exists in storage`);
        console.log(`  Size: ${data.size} bytes`);
      } else {
        console.log(`  ✗ Image NOT found in storage`);
      }
    }
  }
}

debugDeal();