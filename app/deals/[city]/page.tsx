import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DealCard } from '@/components/deal-card'
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
  let { data: city } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', cityParam.replace('-', ' '))
    .single()
    
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

  // Get deals for this city using the city name
  let query = supabase
    .from('deals')
    .select('*')
    .eq('departure_city', city.name)
    .order('found_at', { ascending: false })

  // Filter based on user's plan
  if (userPlan === 'free') {
    // Free users see up to 3 non-premium deals
    query = query.eq('is_premium', false).limit(3)
  } else {
    // Premium users see all deals (up to 9)
    query = query.limit(9)
  }

  const { data: deals } = await query

  // Get some premium deals to show as locked for free users
  let lockedDeals: Deal[] = []
  if (userPlan === 'free') {
    const { data: premiumDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('departure_city', city.name)
      .eq('is_premium', true)
      .order('found_at', { ascending: false })
      .limit(6)
    
    if (premiumDeals) {
      lockedDeals = premiumDeals
    }
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
                : 'Showing 3 free deals updated daily at 10 AM'}
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
          {deals?.map((deal) => (
            <DealCard key={deal.id} deal={deal} isLocked={false} departureCity={city.iata_code.toLowerCase()} departureCityName={city.name} />
          ))}
        </div>

        {userPlan === 'free' && lockedDeals.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Premium Deals - Unlock with Membership
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} isLocked={true} departureCity={city.iata_code.toLowerCase()} departureCityName={city.name} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}