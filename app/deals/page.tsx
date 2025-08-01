import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DealCardNew } from '@/components/deal-card-new'
import { Button } from '@/components/ui/button'
import { MapPin, Sparkles, Globe } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AllDealsPage({ searchParams }: PageProps) {
  const searchParamsAwaited = await searchParams
  const page = Number(searchParamsAwaited.page) || 1
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

  const itemsPerPage = 9
  const offset = (page - 1) * itemsPerPage
  
  // Get total count of all deals
  const { count: totalDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
  
  // Get all deals with pagination
  const { data: allDeals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .order('deal_found_date', { ascending: false })
    .range(offset, offset + itemsPerPage - 1)
  
  // Get all airports with city images
  const { data: airports } = await supabase
    .from('airports')
    .select('iata_code, city_image_url')
  
  // Create a map for quick lookup
  const airportImageMap = new Map(airports?.map(a => [a.iata_code, a.city_image_url]) || [])
  
  if (dealsError) {
    console.error('Error fetching deals:', dealsError)
  }
  
  // Add destination city images to deals
  const dealsWithImages = allDeals?.map(deal => ({
    ...deal,
    destination_city_image: (deal.to_airport_code || deal.destination_airport)
      ? airportImageMap.get(deal.to_airport_code || deal.destination_airport)
      : null
  })) || []
  
  const totalPages = Math.ceil((totalDeals || 0) / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
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

        <h2 className="text-2xl font-bold mb-8">All Flight Deals</h2>
        
        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealsWithImages.map((deal, index) => {
            // For free users, only the very first deal (on page 1) is unlocked
            const isLocked = userPlan === 'free' && (page > 1 || index > 0)
            return (
              <DealCardNew 
                key={deal.id}
                deal={deal} 
                isLocked={isLocked}
                priority={page === 1 && index < 3} 
              />
            )
          })}
        </div>

        {dealsWithImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals available at the moment. Check back soon!</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                window.location.href = `/deals?page=${newPage}`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}