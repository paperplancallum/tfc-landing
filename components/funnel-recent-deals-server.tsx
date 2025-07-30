import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface FunnelRecentDealsServerProps {
  selectedCity?: string
}

export async function FunnelRecentDealsServer({ selectedCity }: FunnelRecentDealsServerProps) {
  const supabase = await createClient()

  // Fetch deals and airports in parallel
  const [dealsResult, airportsResult] = await Promise.all([
    // Try to get deals from selected city first
    selectedCity 
      ? supabase
          .from('deals')
          .select('*')
          .eq('from_airport_city', selectedCity)
          .order('deal_found_date', { ascending: false })
          .limit(3)
      : supabase
          .from('deals')
          .select('*')
          .order('deal_found_date', { ascending: false })
          .limit(3),
    // Get airports for images
    supabase
      .from('airports')
      .select('iata_code, city_image_url')
  ])

  const deals = dealsResult.data || []
  const airports = airportsResult.data || []
  
  // If no deals from selected city, get most recent overall
  if (selectedCity && deals.length === 0) {
    const { data: recentDeals } = await supabase
      .from('deals')
      .select('*')
      .order('deal_found_date', { ascending: false })
      .limit(3)
    
    deals.push(...(recentDeals || []))
  }

  const airportImageMap = new Map(airports.map(a => [a.iata_code, a.city_image_url]))

  // Add destination images
  const dealsWithImages = deals.map(deal => ({
    ...deal,
    destination_city_image: deal.to_airport_code ? 
      airportImageMap.get(deal.to_airport_code) : 
      (deal.destination_airport ? airportImageMap.get(deal.destination_airport) : null)
  }))

  if (dealsWithImages.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="font-bold mb-4">
        Latest Flight Deals Members From {selectedCity || 'Your City'} Received
      </h3>
      <div className="space-y-3">
        {dealsWithImages.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg p-4 flex items-center gap-4">
            <div className="w-24 h-16 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
              {deal.destination_city_image ? (
                <Image
                  src={deal.destination_city_image}
                  alt={deal.destination || deal.to_airport_city || ''}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {deal.destination || `${deal.to_airport_city || deal.to_airport_code} roundtrip`}
              </p>
              <p className="text-sm text-gray-600">
                From: {deal.from_airport_city || deal.from_airport_code}
              </p>
              {deal.deal_found_date && (
                <p className="text-xs text-gray-500">
                  Found {formatDistanceToNow(new Date(deal.deal_found_date), { addSuffix: true })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency === 'EUR' ? '€' : ''}
                {Math.floor(deal.price / 100)}
              </p>
              {deal.regular_price && (
                <p className="text-sm text-gray-500 line-through">
                  {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency === 'EUR' ? '€' : ''}
                  {Math.floor(deal.regular_price / 100)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}