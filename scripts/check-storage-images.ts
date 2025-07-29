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

async function checkStorage() {
  // List all files in city-images bucket
  const { data: files, error } = await supabase.storage
    .from('city-images')
    .list('', {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' }
    });
    
  if (error) {
    console.error('Error listing files:', error);
    return;
  }
  
  console.log(`Found ${files?.length || 0} files in city-images bucket:\n`);
  
  files?.forEach(file => {
    const publicUrl = supabase.storage
      .from('city-images')
      .getPublicUrl(file.name);
      
    console.log(`${file.name}: ${publicUrl.data.publicUrl}`);
  });
  
  // Check specific files
  console.log('\n\nChecking specific files:');
  const checkFiles = ['FNC', 'FNC.jpg', 'FNC.png', 'BER', 'BER.jpg', 'BER.png'];
  
  for (const fileName of checkFiles) {
    const publicUrl = supabase.storage
      .from('city-images')
      .getPublicUrl(fileName);
      
    // Try to download to see if it exists
    const { data, error } = await supabase.storage
      .from('city-images')
      .download(fileName);
      
    if (!error && data) {
      console.log(`✓ ${fileName} exists - URL: ${publicUrl.data.publicUrl}`);
    } else {
      console.log(`✗ ${fileName} does not exist`);
    }
  }
}

checkStorage();