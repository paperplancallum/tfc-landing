import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DealCard } from '@/components/deal-card'
import { Button } from '@/components/ui/button'
import { MapPin, Sparkles, Globe } from 'lucide-react'

export default async function AllDealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user's plan
  let userPlan = 'free'
  let userHomeCity = null
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('plan, home_city_id')
      .eq('id', user.id)
      .single()
    
    if (userData) {
      userPlan = userData.plan
      
      if (userData.home_city_id) {
        // Check if it's a real UUID or a pseudo-ID
        if (userData.home_city_id.startsWith('city-')) {
          // It's a pseudo-ID, extract the city name
          const cityName = userData.home_city_id.replace('city-', '').replace(/-/g, ' ')
          // Find the city from deals
          const { data: dealCity } = await supabase
            .from('deals')
            .select('departure_city, departure_airport')
            .ilike('departure_city', cityName)
            .limit(1)
            .single()
          
          if (dealCity) {
            userHomeCity = {
              id: userData.home_city_id,
              name: dealCity.departure_city,
              iata_code: dealCity.departure_airport
            }
          }
        } else {
          // It's a real UUID from the cities table
          const { data: city } = await supabase
            .from('cities')
            .select('*')
            .eq('id', userData.home_city_id)
            .single()
          userHomeCity = city
        }
      }
    }
  }

  // Get all cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('name')

  // Get the most recent deal for each city
  const dealsByCity = []
  
  // First, get all deals
  const { data: allDeals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (dealsError) {
    console.error('Error fetching deals:', dealsError)
  }
  
  console.log('All deals fetched:', allDeals?.length, 'deals')
  
  // Group deals by departure city
  const dealsByCityName = new Map()
  
  if (allDeals) {
    console.log('Latest deal created at:', allDeals[0]?.created_at)
    for (const deal of allDeals) {
      const cityKey = deal.from_airport_city || 'Unknown'
      if (!dealsByCityName.has(cityKey)) {
        dealsByCityName.set(cityKey, deal)
      }
    }
  }
  
  // Create the final array with city info
  for (const [cityName, deal] of dealsByCityName) {
    const city = cities?.find(c => c.name === cityName) || {
      id: deal.id,
      name: cityName,
      iata_code: deal.from_airport_code || 'XXX'
    }
    
    // Transform new deal structure to old structure for DealCard compatibility
    const transformedDeal = {
      id: deal.id,
      destination: `${deal.to_airport_city || deal.to_airport_code}, ${deal.to_airport_country || ''}`.trim(),
      price: deal.price || 0,
      currency: deal.currency || 'GBP',
      trip_length: deal.trip_duration || 0,
      travel_month: deal.departure_date ? 
        new Date(deal.departure_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
        'Flexible dates',
      photo_url: deal.destination_city_image,
      is_premium: false, // New structure doesn't have this field
      found_at: deal.deal_found_date || deal.created_at,
      departure_city_id: deal.from_airport_code
    }
    
    dealsByCity.push({
      city,
      deal: transformedDeal
    })
  }
  
  // Sort by city name
  dealsByCity.sort((a, b) => a.city.name.localeCompare(b.city.name))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-10 w-10" />
            <h1 className="text-4xl font-bold">
              All Flight Deals
            </h1>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse the latest deals from major cities worldwide. Set your home city to see personalized deals.
          </p>
          
          {userHomeCity ? (
            <Link href={`/deals/${userHomeCity.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <Button size="lg" variant="secondary">
                <MapPin className="mr-2 h-5 w-5" />
                View {userHomeCity.name} Deals Only
              </Button>
            </Link>
          ) : (
            <Link href="/account">
              <Button size="lg" variant="secondary">
                Set Your Home City
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="container py-12">
        {/* Premium Upgrade Banner */}
        {userPlan === 'free' && (
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles size={32} />
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Want More Deals?
                  </h3>
                  <p className="opacity-90">
                    Premium members get 9 daily deals from their home city, 3 hours before everyone else!
                  </p>
                </div>
              </div>
              <Link href="/join">
                <Button variant="secondary" size="lg">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-8">Latest Deals from All Cities</h2>
        
        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealsByCity.map(({ city, deal }) => (
            <DealCard 
              key={city.id}
              deal={deal} 
              isLocked={false} 
              departureCity={city.iata_code.toLowerCase()}
              departureCityName={city.name}
            />
          ))}
        </div>

        {dealsByCity.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals available at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}