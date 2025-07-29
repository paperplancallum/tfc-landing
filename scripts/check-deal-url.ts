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

async function checkDealUrl() {
  // Get a sample deal to check fields
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .limit(1)
    .single();
    
  if (deal) {
    console.log('Deal fields:');
    Object.keys(deal).forEach(key => {
      console.log(`  ${key}: ${typeof deal[key]}`);
    });
    
    // Check specifically for deal_url
    if ('deal_url' in deal) {
      console.log(`\nFound deal_url field! Value: ${deal.deal_url}`);
    } else {
      console.log('\nNo deal_url field found in deals table');
    }
  }
  
  // Check BCN-BSL deal specifically
  const { data: bcnBslDeal } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', 'BCN')
    .eq('to_airport_code', 'BSL')
    .single();
    
  if (bcnBslDeal) {
    console.log('\nBCN-BSL deal:');
    console.log(`  deal_url: ${bcnBslDeal.deal_url || 'NOT SET'}`);
  }
}

checkDealUrl();