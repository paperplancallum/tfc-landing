import { createClient } from '@/lib/supabase/server'
import { DealCardNew } from '@/components/deal-card-new'

interface DealsListProps {
  city: {
    id: string
    name: string
    iata_code: string
  }
  userPlan: string
  page?: number
}

export async function DealsList({ city, userPlan, page = 1 }: DealsListProps) {
  const supabase = await createClient()
  const itemsPerPage = 9
  const offset = (page - 1) * itemsPerPage
  
  // Get total count of deals for this city
  const { count: totalDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('from_airport_city', city.name)
  
  // Fetch deals and airports in parallel
  const [dealsResult, airportsResult] = await Promise.all([
    supabase
      .from('deals')
      .select('*')
      .eq('from_airport_city', city.name)
      .order('created_at', { ascending: false })
      .range(offset, offset + itemsPerPage - 1),
    supabase
      .from('airports')
      .select('iata_code, city_image_url')
  ])
  
  const allDeals = dealsResult.data || []
  const airports = airportsResult.data || []
  
  // Create a map for quick lookup
  const airportImageMap = new Map(airports.map(a => [a.iata_code, a.city_image_url]))
  
  // Add destination city images to deals
  const dealsWithImages = allDeals.map(deal => ({
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
    freeDeals = dealsWithImages
    premiumDeals = []
  }

  const totalPages = Math.ceil((totalDeals || 0) / itemsPerPage)
  
  return {
    deals: (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freeDeals?.map((deal) => (
          <DealCardNew key={deal.id} deal={deal} isLocked={false} />
        ))}
        {premiumDeals?.map((deal) => (
          <DealCardNew key={deal.id} deal={deal} isLocked={true} />
        ))}
      </div>
    ),
    totalDeals: totalDeals || 0,
    totalPages,
    currentPage: page
  }
}