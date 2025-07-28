import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const mockDeals = [
  // London deals
  {
    departure_city_id: 'LON',
    destination: 'Barcelona, Spain',
    price: 89,
    currency: 'GBP',
    trip_length: 4,
    travel_month: 'March 2024',
    photo_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    is_premium: false,
  },
  {
    departure_city_id: 'LON',
    destination: 'Amsterdam, Netherlands',
    price: 65,
    currency: 'GBP',
    trip_length: 3,
    travel_month: 'February 2024',
    photo_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    is_premium: false,
  },
  {
    departure_city_id: 'LON',
    destination: 'Rome, Italy',
    price: 120,
    currency: 'GBP',
    trip_length: 5,
    travel_month: 'April 2024',
    photo_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    is_premium: false,
  },
  // Premium deals
  {
    departure_city_id: 'LON',
    destination: 'Tokyo, Japan',
    price: 399,
    currency: 'GBP',
    trip_length: 10,
    travel_month: 'May 2024',
    photo_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    is_premium: true,
  },
  {
    departure_city_id: 'LON',
    destination: 'New York, USA',
    price: 289,
    currency: 'GBP',
    trip_length: 7,
    travel_month: 'March 2024',
    photo_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    is_premium: true,
  },
  {
    departure_city_id: 'LON',
    destination: 'Dubai, UAE',
    price: 250,
    currency: 'GBP',
    trip_length: 5,
    travel_month: 'April 2024',
    photo_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    is_premium: true,
  },
  {
    departure_city_id: 'LON',
    destination: 'Sydney, Australia',
    price: 599,
    currency: 'GBP',
    trip_length: 14,
    travel_month: 'June 2024',
    photo_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    is_premium: true,
  },
  {
    departure_city_id: 'LON',
    destination: 'Bangkok, Thailand',
    price: 349,
    currency: 'GBP',
    trip_length: 10,
    travel_month: 'May 2024',
    photo_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
    is_premium: true,
  },
  {
    departure_city_id: 'LON',
    destination: 'Singapore',
    price: 380,
    currency: 'GBP',
    trip_length: 8,
    travel_month: 'April 2024',
    photo_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
    is_premium: true,
  },
]

async function seedDeals() {
  try {
    // First get the London city ID
    const { data: cities, error: cityError } = await supabase
      .from('cities')
      .select('id')
      .eq('iata_code', 'LON')
      .single()

    if (cityError || !cities) {
      console.error('Error fetching London city:', cityError)
      return
    }

    // Update deals with actual city ID
    const dealsWithCityId = mockDeals.map(deal => ({
      ...deal,
      departure_city_id: cities.id,
      found_at: new Date().toISOString(),
    }))

    // Insert deals
    const { data, error } = await supabase
      .from('deals')
      .insert(dealsWithCityId)
      .select()

    if (error) {
      console.error('Error inserting deals:', error)
    } else {
      console.log('Successfully added', data?.length, 'deals')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Only run this once
seedDeals()