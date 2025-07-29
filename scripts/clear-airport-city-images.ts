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

async function clearAirportCityImages() {
  try {
    console.log('Starting to clear city image URLs from airports table...');
    
    // First, let's see how many airports have city images
    const { data: airportsWithImages, error: countError } = await supabase
      .from('airports')
      .select('id, iata_code, city_name, city_image_url')
      .not('city_image_url', 'is', null);
    
    if (countError) {
      console.error('Error counting airports with images:', countError);
      return;
    }
    
    console.log(`Found ${airportsWithImages?.length || 0} airports with city images`);
    
    if (airportsWithImages && airportsWithImages.length > 0) {
      console.log('Sample airports with images:');
      airportsWithImages.slice(0, 5).forEach(airport => {
        console.log(`- ${airport.iata_code} (${airport.city_name}): ${airport.city_image_url?.substring(0, 50)}...`);
      });
    }
    
    // Clear all city_image_url values
    const { data, error } = await supabase
      .from('airports')
      .update({ city_image_url: null })
      .not('city_image_url', 'is', null)
      .select();
    
    if (error) {
      console.error('Error clearing city images:', error);
      return;
    }
    
    console.log(`\n✅ Successfully cleared city images from ${data?.length || 0} airports`);
    
    // Verify the update
    const { data: remainingImages, error: verifyError } = await supabase
      .from('airports')
      .select('id')
      .not('city_image_url', 'is', null);
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log(`\nVerification: ${remainingImages?.length || 0} airports still have city images (should be 0)`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
clearAirportCityImages();