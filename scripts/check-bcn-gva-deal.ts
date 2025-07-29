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

async function checkDeal() {
  // Check for BCN -> GVA deal
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', 'BCN')
    .eq('to_airport_code', 'GVA')
    .single();
    
  if (deal) {
    console.log('BCN -> GVA Deal found:');
    console.log(`  Price: ${deal.currency}${deal.price}`);
    console.log(`  Price value: ${deal.price}`);
    console.log(`  Price type: ${typeof deal.price}`);
    console.log(`  Full deal:`, deal);
  } else {
    console.log('No BCN -> GVA deal found');
    
    // Check what BCN deals exist
    const { data: bcnDeals } = await supabase
      .from('deals')
      .select('from_airport_code, to_airport_code, price, currency')
      .eq('from_airport_code', 'BCN')
      .limit(5);
      
    console.log('\nBCN deals:', bcnDeals);
  }
}

checkDeal();