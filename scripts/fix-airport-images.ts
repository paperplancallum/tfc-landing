import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CityImageRow {
  iata: string;
  skyId: string;
  image: string;
}

async function fixAirportImages() {
  // Read CSV file to get the list of airports
  const csvPath = path.join(process.cwd(), 'images.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV
  const records: CityImageRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`Found ${records.length} records to process`);

  // First, let's check what airports exist in the database
  const { data: airports, error: fetchError } = await supabase
    .from('airports')
    .select('iata_code, city_image_url')
    .order('iata_code');

  if (fetchError) {
    console.error('Error fetching airports:', fetchError);
    return;
  }

  console.log(`Found ${airports?.length} airports in database`);

  // Create a map of existing airports
  const airportMap = new Map(airports?.map(a => [a.iata_code, a]));

  // Process updates
  let successCount = 0;
  let notFoundCount = 0;
  let alreadySetCount = 0;

  for (const record of records) {
    const iataCode = record.iata.toUpperCase(); // Ensure uppercase
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/city-images/${record.iata.toLowerCase()}.jpg`;
    
    const existingAirport = airportMap.get(iataCode);
    
    if (!existingAirport) {
      console.log(`Airport ${iataCode} not found in database`);
      notFoundCount++;
      continue;
    }

    if (existingAirport.city_image_url) {
      alreadySetCount++;
      continue;
    }

    // Try direct SQL update using RPC if regular update fails
    const { error: updateError } = await supabase
      .rpc('update_airport_image', {
        p_iata_code: iataCode,
        p_image_url: imageUrl
      })
      .single();

    if (updateError) {
      // If RPC doesn't exist, try regular update
      const { error: regularUpdateError } = await supabase
        .from('airports')
        .update({ city_image_url: imageUrl })
        .eq('iata_code', iataCode);

      if (regularUpdateError) {
        console.error(`Failed to update ${iataCode}:`, regularUpdateError.message);
      } else {
        successCount++;
      }
    } else {
      successCount++;
    }
  }

  console.log(`\nUpdate complete:`);
  console.log(`Success: ${successCount}`);
  console.log(`Not found: ${notFoundCount}`);
  console.log(`Already set: ${alreadySetCount}`);

  // Verify updates
  const { count } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true })
    .not('city_image_url', 'is', null);

  console.log(`\nTotal airports with images: ${count}`);
}

fixAirportImages();