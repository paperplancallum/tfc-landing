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

async function checkPrices() {
  const { data: deals } = await supabase
    .from('deals')
    .select('from_airport_code, to_airport_code, price, currency')
    .order('price', { ascending: true });
    
  console.log('All deals sorted by price:');
  deals?.forEach(deal => {
    console.log(`${deal.from_airport_code} -> ${deal.to_airport_code}: ${deal.currency}${deal.price} (raw: ${deal.price})`);
  });
  
  // Group by currency to see patterns
  const byGBP = deals?.filter(d => d.currency === 'GBP');
  const byEUR = deals?.filter(d => d.currency === 'EUR');
  
  console.log('\n\nGBP deals:');
  byGBP?.forEach(deal => {
    console.log(`  ${deal.from_airport_code} -> ${deal.to_airport_code}: £${deal.price}`);
  });
  
  console.log('\nEUR deals:');
  byEUR?.forEach(deal => {
    console.log(`  ${deal.from_airport_code} -> ${deal.to_airport_code}: €${deal.price}`);
  });
}

checkPrices();