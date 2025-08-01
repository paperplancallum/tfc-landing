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
  
  // Fetch deals with destination airport images in a single query
  const { data: allDeals, error } = await supabase
    .from('deals')
    .select(`
      *,
      destination_airport:airports!deals_to_airport_code_fkey (
        city_image_url
      )
    `)
    .eq('from_airport_city', city.name)
    .order('created_at', { ascending: false })
    .range(offset, offset + itemsPerPage - 1)
  
  if (error) {
    console.error('Error fetching deals:', error)
  }
  
  // Transform deals to include destination city image
  const dealsWithImages = (allDeals || []).map(deal => ({
    ...deal,
    destination_city_image: deal.destination_airport?.city_image_url || null,
    destination_airport: undefined // Remove the joined object
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