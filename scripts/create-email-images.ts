import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
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

async function resizeImageForEmail(buffer: Buffer): Promise<Buffer> {
  // Resize to 400x300 pixels and optimize for email
  return await sharp(buffer)
    .resize(400, 300, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({
      quality: 80,
      progressive: true
    })
    .toBuffer();
}

async function uploadImageToSupabase(buffer: Buffer, fileName: string, bucketName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
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

  // Create email-images bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'email-images');
  
  if (!bucketExists) {
    console.log('Note: Please create an "email-images" bucket in Supabase Storage with public access');
    return;
  }

  // Process each record
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches
  const batchSize = 5;
  
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
        
        // Download original image
        const imageBuffer = await downloadImage(imageUrl);
        
        // Resize for email
        const resizedBuffer = await resizeImageForEmail(imageBuffer);
        
        // Create filename
        const fileName = `${iataCode.toLowerCase()}.jpg`;
        
        // Upload to email-images bucket
        const emailImageUrl = await uploadImageToSupabase(resizedBuffer, fileName, 'email-images');
        
        console.log(`✓ Successfully processed ${iataCode} - Size reduced from ${(imageBuffer.length / 1024).toFixed(0)}KB to ${(resizedBuffer.length / 1024).toFixed(0)}KB`);
        successCount++;
        
      } catch (error) {
        console.error(`✗ Error processing ${iataCode}:`, error);
        errorCount++;
      }
    }));
    
    // Add delay between batches
    if (i + batchSize < records.length) {
      console.log(`Processed ${Math.min(i + batchSize, records.length)} of ${records.length}. Waiting before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\nProcessing complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  console.log('\nNext steps:');
  console.log('1. Update the email service to use the email-images bucket');
  console.log('2. Images are now optimized at 400x300 pixels, ~80KB each');
}

main().catch(console.error);