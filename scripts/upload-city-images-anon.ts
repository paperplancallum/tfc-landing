import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  
  // Note: Creating buckets requires service role key
  // For now, assume the bucket exists or create it manually
  console.log('Note: Please ensure the "city-images" bucket exists in Supabase Storage');
  console.log('You may need to create it manually with public access enabled');

  // Process each record
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches to avoid rate limiting
  const batchSize = 10;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (record) => {
      const iataCode = record.iata;
      const imageUrl = record.image;
      
      if (!imageUrl || !iataCode) {
        console.log(`Skipping record with missing data: ${iataCode}`);
        return;
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
        
      } catch (error) {
        console.error(`✗ Error processing ${iataCode}:`, error);
        errorCount++;
      }
    }));
    
    // Add delay between batches
    if (i + batchSize < records.length) {
      console.log(`Processed ${i + batchSize} of ${records.length}. Waiting before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\nProcessing complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

main().catch(console.error);