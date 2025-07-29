import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  console.error('You can find the service role key in your Supabase dashboard under Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CityImageRow {
  iata: string;
  skyId: string;
  image: string;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImageToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('city-images')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('city-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

async function updateAirportImage(iataCode: string, imageUrl: string) {
  const { error } = await supabase
    .from('airports')
    .update({ city_image_url: imageUrl })
    .eq('iata_code', iataCode);

  if (error) {
    console.error(`Failed to update airport ${iataCode}:`, error);
    return false;
  }
  return true;
}

async function main() {
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'images.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV
  const records: CityImageRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`Found ${records.length} records to process`);

  // Create storage bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'city-images');
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket('city-images', {
      public: true
    });
    if (error) {
      console.error('Failed to create bucket:', error);
      process.exit(1);
    }
    console.log('Created city-images bucket');
  }

  // Process each record
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    const iataCode = record.iata;
    const imageUrl = record.image;
    
    if (!imageUrl || !iataCode) {
      console.log(`Skipping record with missing data: ${iataCode}`);
      continue;
    }

    try {
      console.log(`Processing ${iataCode}...`);
      
      // Download image
      const imageBuffer = await downloadImage(imageUrl);
      
      // Create filename based on IATA code
      const fileName = `${iataCode.toLowerCase()}.jpg`;
      
      // Upload to Supabase
      const supabaseUrl = await uploadImageToSupabase(imageBuffer, fileName);
      
      // Update airport record
      const updated = await updateAirportImage(iataCode, supabaseUrl);
      
      if (updated) {
        console.log(`✓ Successfully processed ${iataCode}`);
        successCount++;
      } else {
        console.log(`✗ Failed to update database for ${iataCode}`);
        errorCount++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`✗ Error processing ${iataCode}:`, error);
      errorCount++;
    }
  }

  console.log(`\nProcessing complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

main().catch(console.error);