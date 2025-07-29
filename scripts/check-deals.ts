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

async function checkDeals() {
  // First, let's see all deals
  const { data: allDeals, count } = await supabase
    .from('deals')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log(`\nTotal deals in database: ${count}`);
  console.log('\nSample deals:');
  allDeals?.forEach((deal, index) => {
    console.log(`\n${index + 1}. ${deal.from_airport_code} (${deal.from_airport_city}) -> ${deal.to_airport_code} (${deal.to_airport_city})`);
    console.log(`   Price: ${deal.currency}${(deal.price / 100).toFixed(2)}`);
    console.log(`   Date: ${deal.deal_found_date}`);
  });
  
  console.log('\n' + '='.repeat(50));

  try {
    // Check specific deal
    console.log('Checking for LTN -> ZRH deal...\n');
    
    const { data: specificDeal, error } = await supabase
      .from('deals')
      .select('*')
      .eq('from_airport_code', 'LTN')
      .eq('to_airport_code', 'ZRH')
      .order('deal_found_date', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching deals:', error);
      return;
    }
    
    if (specificDeal && specificDeal.length > 0) {
      console.log(`Found ${specificDeal.length} LTN -> ZRH deals:`);
      specificDeal.forEach((deal, index) => {
        console.log(`\nDeal ${index + 1}:`);
        console.log(`  ID: ${deal.id}`);
        console.log(`  From: ${deal.from_airport_code} (${deal.from_airport_city})`);
        console.log(`  To: ${deal.to_airport_code} (${deal.to_airport_city})`);
        console.log(`  Price: ${deal.currency}${(deal.price / 100).toFixed(2)}`);
        console.log(`  Found Date: ${deal.deal_found_date}`);
        console.log(`  Departure: ${deal.departure_date}`);
        console.log(`  Return: ${deal.return_date}`);
      });
    } else {
      console.log('No LTN -> ZRH deals found');
    }
    
    // Check any London -> Zurich deals
    console.log('\n\nChecking for any London -> Zurich deals...\n');
    
    const { data: londonDeals } = await supabase
      .from('deals')
      .select('*')
      .ilike('from_airport_city', '%London%')
      .ilike('to_airport_city', '%Zurich%')
      .order('deal_found_date', { ascending: false })
      .limit(5);
    
    if (londonDeals && londonDeals.length > 0) {
      console.log(`Found ${londonDeals.length} London -> Zurich deals:`);
      londonDeals.forEach((deal, index) => {
        console.log(`\nDeal ${index + 1}:`);
        console.log(`  From: ${deal.from_airport_code} (${deal.from_airport_city})`);
        console.log(`  To: ${deal.to_airport_code} (${deal.to_airport_city})`);
        console.log(`  Price: ${deal.currency}${(deal.price / 100).toFixed(2)}`);
        console.log(`  Found Date: ${deal.deal_found_date}`);
      });
    }
    
    // Check a random deal to see structure
    console.log('\n\nSample deal structure:');
    const { data: sampleDeal } = await supabase
      .from('deals')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleDeal) {
      console.log('\nColumns in deals table:');
      Object.keys(sampleDeal).forEach(key => {
        console.log(`  ${key}: ${typeof sampleDeal[key as keyof typeof sampleDeal]}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
checkDeals();