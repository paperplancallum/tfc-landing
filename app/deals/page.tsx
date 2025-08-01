import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DealCardNew } from '@/components/deal-card-new'
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
        const { data: city } = await supabase
          .from('cities')
          .select('*')
          .eq('id', userData.home_city_id)
          .single()
        userHomeCity = city
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
  const seenCities = new Set<string>()
  
  // First, get all deals ordered by most recent
  const { data: allDeals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .order('deal_found_date', { ascending: false }) // Order by when deal was found, not created
  
  // Get all airports with city images
  const { data: airports } = await supabase
    .from('airports')
    .select('iata_code, city_image_url')
  
  // Create a map for quick lookup
  const airportImageMap = new Map(airports?.map(a => [a.iata_code, a.city_image_url]) || [])
  
  if (dealsError) {
    console.error('Error fetching deals:', dealsError)
  }
  
  console.log('All deals fetched:', allDeals?.length, 'deals')
  
  // Get only the most recent deal per departure city
  if (allDeals) {
    for (const deal of allDeals) {
      const cityKey = deal.from_airport_city || deal.from_airport_code
      
      // Skip if we've already seen a deal from this city
      if (seenCities.has(cityKey)) {
        continue
      }
      
      seenCities.add(cityKey)
      
      const city = cities?.find(c => c.name === deal.from_airport_city) || {
        id: `city-${cityKey}`,
        name: deal.from_airport_city || 'Unknown',
        iata_code: deal.from_airport_code || 'XXX'
      }
      
      // Add destination city image from airports table
      const destinationAirport = deal.to_airport_code || deal.destination_airport
      const dealWithImage = {
        ...deal,
        destination_city_image: destinationAirport ? airportImageMap.get(destinationAirport) : null
      }
      
      dealsByCity.push({
        city,
        deal: dealWithImage
      })
    }
  }
  
  // Sort by city name
  dealsByCity.sort((a, b) => a.city.name.localeCompare(b.city.name))
  
  console.log('Final dealsByCity array length:', dealsByCity.length)
  console.log('Unique cities with deals:', dealsByCity.map(d => d.city.name).join(', '))

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
            {userPlan === 'premium' && !userHomeCity
              ? 'Welcome! Select your home city to see personalized premium deals delivered daily.'
              : 'Browse the latest deals from major cities worldwide. Set your home city to see personalized deals.'
            }
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
                {userPlan === 'premium' ? 'Select Your Home City' : 'Set Your Home City'}
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="container py-12">
        {/* Premium Upgrade Banner */}
        {userPlan === 'free' && (
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                <Sparkles size={32} className="flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Want More Deals?
                  </h3>
                  <p className="opacity-90">
                    Premium members get 9 daily deals from their home city, 3 hours before everyone else!
                  </p>
                </div>
              </div>
              <Link href="/join" className="w-full md:w-auto">
                <Button variant="secondary" size="lg" className="w-full md:w-auto">
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
            <DealCardNew 
              key={deal.id}
              deal={deal} 
              isLocked={false} 
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