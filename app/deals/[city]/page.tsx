import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DealCardNew } from '@/components/deal-card-new'
import { UpgradeBanner } from '@/components/upgrade-banner'
import { Button } from '@/components/ui/button'
import { Globe, MapPin } from 'lucide-react'

interface Deal {
  id: string
  destination: string
  price: number
  currency: string
  trip_length: number
  travel_month: string
  photo_url: string | null
  is_premium: boolean
  found_at: string
}

interface City {
  id: string
  name: string
  iata_code: string
}

export default async function DealsPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: cityParam } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get city info - handle both full names and IATA codes for backward compatibility
  let city: City | null = null
  const cityName = cityParam.replace(/-/g, ' ')
  
  // First try to find in cities table
  let { data: cityFromTable } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', cityName)
    .single()
    
  if (cityFromTable) {
    city = cityFromTable
  } else {
    // If not found in cities table, check if there are deals from this city
    const { data: dealFromCity } = await supabase
      .from('deals')
      .select('from_airport_city, from_airport_code')
      .ilike('from_airport_city', cityName)
      .limit(1)
      .single()
    
    if (dealFromCity) {
      // Create a pseudo city object
      city = {
        id: `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
        name: dealFromCity.from_airport_city,
        iata_code: dealFromCity.from_airport_code
      }
    }
  }
  
  // If not found by name, try IATA code
  if (!city) {
    const { data: cityByCode } = await supabase
      .from('cities')
      .select('*')
      .eq('iata_code', cityParam.toUpperCase())
      .single()
    city = cityByCode
  }

  if (!city) {
    notFound()
  }

  // Get user's plan
  let userPlan = 'free'
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
    
    if (userData) {
      userPlan = userData.plan
    }
  }

  // Get deals for this city using the new structure
  let query = supabase
    .from('deals')
    .select('*')
    .eq('from_airport_city', city.name)
    .order('created_at', { ascending: false })

  // Get all deals for the city (up to 9)
  query = query.limit(9)
  const { data: allDeals } = await query
  
  // Get all airports with city images
  const { data: airports } = await supabase
    .from('airports')
    .select('iata_code, city_image_url')
  
  // Create a map for quick lookup
  const airportImageMap = new Map(airports?.map(a => [a.iata_code, a.city_image_url]) || [])
  
  // Add destination city images to deals
  const dealsWithImages = allDeals?.map(deal => ({
    ...deal,
    destination_city_image: (deal.to_airport_code || deal.destination_airport) 
      ? airportImageMap.get(deal.to_airport_code || deal.destination_airport) 
      : null
  }))

  let freeDeals = []
  let premiumDeals = []

  if (userPlan === 'free' && dealsWithImages) {
    // Free users see only 1 deal, rest are premium
    freeDeals = dealsWithImages.slice(0, 1)
    premiumDeals = dealsWithImages.slice(1)
  } else {
    // Premium users see all deals
    freeDeals = dealsWithImages || []
    premiumDeals = []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {city.name} Flight Deals
              </h1>
            </div>
            <p className="text-gray-600">
              {userPlan === 'premium' 
                ? 'Showing up to 9 premium deals updated daily at 7 AM'
                : 'Showing 1 free deal - Unlock 8 more with Premium'}
            </p>
          </div>
          <Link href="/deals">
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              View All Cities
            </Button>
          </Link>
        </div>

        {userPlan === 'free' && <UpgradeBanner />}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {freeDeals?.map((deal) => (
            <DealCardNew key={deal.id} deal={deal} isLocked={false} />
          ))}
          {premiumDeals?.map((deal) => (
            <DealCardNew key={deal.id} deal={deal} isLocked={true} />
          ))}
        </div>
      </div>
    </div>
  )
}