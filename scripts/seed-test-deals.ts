import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTestDeals() {
  try {
    // First, find London city ID
    const { data: londonCity, error: cityError } = await supabase
      .from('cities')
      .select('id, name')
      .eq('name', 'London')
      .single();

    if (cityError || !londonCity) {
      console.error('Could not find London in cities table:', cityError);
      return;
    }

    console.log('Found London city:', londonCity);

    // Sample deals for testing
    const testDeals = [
      // Free deals
      {
        departure_city_id: londonCity.id,
        departure_city: 'London',
        departure_airport: 'LHR',
        destination_city: 'Barcelona',
        destination_airport: 'BCN',
        destination: 'Spain',
        price: 89,
        currency: 'GBP',
        trip_length: 4,
        travel_month: 'February 2025',
        is_premium: false,
        photo_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        found_at: new Date().toISOString(),
        airline: 'Ryanair',
        deal_type: 'round_trip',
        stops: 0,
        cabin_class: 'economy',
        booking_url: 'https://example.com/barcelona-deal'
      },
      {
        departure_city_id: londonCity.id,
        departure_city: 'London',
        departure_airport: 'LGW',
        destination_city: 'Rome',
        destination_airport: 'FCO',
        destination: 'Italy',
        price: 125,
        currency: 'GBP',
        trip_length: 3,
        travel_month: 'March 2025',
        is_premium: false,
        photo_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        found_at: new Date().toISOString(),
        airline: 'EasyJet',
        deal_type: 'round_trip',
        stops: 0,
        cabin_class: 'economy',
        booking_url: 'https://example.com/rome-deal'
      },
      {
        departure_city_id: londonCity.id,
        departure_city: 'London',
        departure_airport: 'STN',
        destination_city: 'Amsterdam',
        destination_airport: 'AMS',
        destination: 'Netherlands',
        price: 65,
        currency: 'GBP',
        trip_length: 2,
        travel_month: 'January 2025',
        is_premium: false,
        photo_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
        found_at: new Date().toISOString(),
        airline: 'Ryanair',
        deal_type: 'round_trip',
        stops: 0,
        cabin_class: 'economy',
        booking_url: 'https://example.com/amsterdam-deal'
      },
      // Premium deals
      {
        departure_city_id: londonCity.id,
        departure_city: 'London',
        departure_airport: 'LHR',
        destination_city: 'New York',
        destination_airport: 'JFK',
        destination: 'USA',
        price: 299,
        currency: 'GBP',
        trip_length: 7,
        travel_month: 'April 2025',
        is_premium: true,
        photo_url: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800',
        found_at: new Date().toISOString(),
        airline: 'British Airways',
        deal_type: 'round_trip',
        stops: 0,
        cabin_class: 'economy',
        booking_url: 'https://example.com/nyc-deal'
      },
      {
        departure_city_id: londonCity.id,
        departure_city: 'London',
        departure_airport: 'LHR',
        destination_city: 'Tokyo',
        destination_airport: 'NRT',
        destination: 'Japan',
        price: 499,
        currency: 'GBP',
        trip_length: 10,
        travel_month: 'May 2025',
        is_premium: true,
        photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        found_at: new Date().toISOString(),
        airline: 'JAL',
        deal_type: 'round_trip',
        stops: 0,
        cabin_class: 'economy',
        booking_url: 'https://example.com/tokyo-deal'
      },
      {
        departure_city_id: londonCity.id,
        departure_city: 'London',
        departure_airport: 'LHR',
        destination_city: 'Dubai',
        destination_airport: 'DXB',
        destination: 'UAE',
        price: 379,
        currency: 'GBP',
        trip_length: 5,
        travel_month: 'March 2025',
        is_premium: true,
        photo_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        found_at: new Date().toISOString(),
        airline: 'Emirates',
        deal_type: 'round_trip',
        stops: 0,
        cabin_class: 'economy',
        booking_url: 'https://example.com/dubai-deal'
      }
    ];

    // Insert test deals
    const { data: insertedDeals, error: insertError } = await supabase
      .from('deals')
      .insert(testDeals)
      .select();

    if (insertError) {
      console.error('Error inserting deals:', insertError);
      return;
    }

    console.log(`Successfully inserted ${insertedDeals.length} test deals for London!`);
    
    // Show the inserted deals
    insertedDeals.forEach(deal => {
      console.log(`- ${deal.destination_city} (${deal.destination}) - £${deal.price} - ${deal.is_premium ? 'Premium' : 'Free'}`);
    });

  } catch (error) {
    console.error('Error in seed script:', error);
  }
}

// Run the seed function
seedTestDeals();