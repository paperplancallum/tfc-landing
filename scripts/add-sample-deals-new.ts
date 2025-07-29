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

// Sample deals with the new schema
const sampleDeals = [
  // London to Zurich deal that matches the URL
  {
    from_airport_code: 'LTN',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'ZRH',
    to_airport_name: 'Zurich Airport',
    to_airport_city: 'Zurich',
    to_airport_country: 'Switzerland',
    departure_date: '2025-07-29',
    return_date: '2025-08-02',
    trip_duration: 4,
    deal_found_date: '2025-07-29',
    price: 71.00,
    currency: 'GBP',
    airline: 'EasyJet',
  },
  // More London deals
  {
    from_airport_code: 'LHR',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'BCN',
    to_airport_name: 'Barcelona-El Prat Airport',
    to_airport_city: 'Barcelona',
    to_airport_country: 'Spain',
    departure_date: '2025-08-15',
    return_date: '2025-08-19',
    trip_duration: 4,
    deal_found_date: '2025-07-29',
    price: 89.00,
    currency: 'GBP',
    airline: 'British Airways',
  },
  {
    from_airport_code: 'STN',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'AMS',
    to_airport_name: 'Amsterdam Airport Schiphol',
    to_airport_city: 'Amsterdam',
    to_airport_country: 'Netherlands',
    departure_date: '2025-09-01',
    return_date: '2025-09-04',
    trip_duration: 3,
    deal_found_date: '2025-07-29',
    price: 65.00,
    currency: 'GBP',
    airline: 'Ryanair',
  },
  {
    from_airport_code: 'LGW',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'FCO',
    to_airport_name: 'Leonardo da Vinci-Fiumicino Airport',
    to_airport_city: 'Rome',
    to_airport_country: 'Italy',
    departure_date: '2025-10-10',
    return_date: '2025-10-15',
    trip_duration: 5,
    deal_found_date: '2025-07-29',
    price: 120.00,
    currency: 'GBP',
    airline: 'Vueling',
  },
  // Premium deals
  {
    from_airport_code: 'LHR',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'JFK',
    to_airport_name: 'John F. Kennedy International Airport',
    to_airport_city: 'New York',
    to_airport_country: 'United States',
    departure_date: '2025-11-20',
    return_date: '2025-11-27',
    trip_duration: 7,
    deal_found_date: '2025-07-29',
    price: 289.00,
    currency: 'GBP',
    airline: 'Virgin Atlantic',
  },
  {
    from_airport_code: 'LHR',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'NRT',
    to_airport_name: 'Narita International Airport',
    to_airport_city: 'Tokyo',
    to_airport_country: 'Japan',
    departure_date: '2025-12-05',
    return_date: '2025-12-15',
    trip_duration: 10,
    deal_found_date: '2025-07-29',
    price: 399.00,
    currency: 'GBP',
    airline: 'Japan Airlines',
  },
  {
    from_airport_code: 'LHR',
    from_airport_city: 'London',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'DXB',
    to_airport_name: 'Dubai International Airport',
    to_airport_city: 'Dubai',
    to_airport_country: 'United Arab Emirates',
    departure_date: '2025-08-25',
    return_date: '2025-08-30',
    trip_duration: 5,
    deal_found_date: '2025-07-29',
    price: 250.00,
    currency: 'GBP',
    airline: 'Emirates',
  },
  // Different cities
  {
    from_airport_code: 'MAN',
    from_airport_city: 'Manchester',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'MAD',
    to_airport_name: 'Adolfo Suárez Madrid-Barajas Airport',
    to_airport_city: 'Madrid',
    to_airport_country: 'Spain',
    departure_date: '2025-09-10',
    return_date: '2025-09-14',
    trip_duration: 4,
    deal_found_date: '2025-07-29',
    price: 95.00,
    currency: 'GBP',
    airline: 'Iberia',
  },
  {
    from_airport_code: 'EDI',
    from_airport_city: 'Edinburgh',
    from_airport_country: 'United Kingdom',
    to_airport_code: 'CPH',
    to_airport_name: 'Copenhagen Airport',
    to_airport_city: 'Copenhagen',
    to_airport_country: 'Denmark',
    departure_date: '2025-10-20',
    return_date: '2025-10-23',
    trip_duration: 3,
    deal_found_date: '2025-07-29',
    price: 75.00,
    currency: 'GBP',
    airline: 'SAS',
  },
];

async function addSampleDeals() {
  try {
    console.log('Adding sample deals to database...\n');
    
    // First, clear any existing deals
    const { error: deleteError } = await supabase
      .from('deals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('Error clearing existing deals:', deleteError);
      return;
    }
    
    // Insert new deals
    const { data, error } = await supabase
      .from('deals')
      .insert(sampleDeals)
      .select();
    
    if (error) {
      console.error('Error inserting deals:', error);
      return;
    }
    
    console.log(`Successfully added ${data?.length || 0} deals\n`);
    
    // Show what was added
    if (data && data.length > 0) {
      console.log('Added deals:');
      data.forEach((deal, index) => {
        console.log(`\n${index + 1}. ${deal.from_airport_code} (${deal.from_airport_city}) → ${deal.to_airport_code} (${deal.to_airport_city})`);
        console.log(`   Price: ${deal.currency}${deal.price}`);
        console.log(`   Dates: ${deal.departure_date} to ${deal.return_date}`);
        console.log(`   Airline: ${deal.airline}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
addSampleDeals();