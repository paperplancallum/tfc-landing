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

async function testDealUrl() {
  console.log('Checking deal URLs...');
  // Update a deal to have a test URL if it doesn't have one
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', 'LTN')
    .eq('to_airport_code', 'ZRH')
    .single();
    
  if (deal) {
    console.log('LTN-ZRH deal:');
    console.log(`  Current deal_url: ${deal.deal_url || 'NONE'}`);
    
    if (!deal.deal_url) {
      // Add a sample URL
      const { error } = await supabase
        .from('deals')
        .update({ 
          deal_url: 'https://www.skyscanner.com/transport/flights/ltn/zrh/250729/250802/?adultsv2=1&cabinclass=economy&ref=tomsflightclub' 
        })
        .eq('id', deal.id);
        
      if (!error) {
        console.log('  Added sample deal_url');
      }
    }
  }
}

testDealUrl().catch(console.error);