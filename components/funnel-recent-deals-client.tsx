'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Deal {
  id: string
  destination?: string
  to_airport_city?: string
  to_airport_code?: string
  from_airport_city?: string
  from_airport_code?: string
  price: number
  regular_price?: number
  currency: string
  destination_city_image?: string
  deal_found_date?: string
}

export function FunnelRecentDealsClient() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [cityName, setCityName] = useState('')

  useEffect(() => {
    async function fetchDeals() {
      const supabase = createClient()
      
      // Get selected airport from session
      let selectedCity = ''
      if (typeof window !== 'undefined') {
        const airport = sessionStorage.getItem('selectedAirport') || ''
        selectedCity = airport.split(' - ')[0] || ''
        setCityName(selectedCity)
      }

      // Get airports for images
      const { data: airports } = await supabase
        .from('airports')
        .select('iata_code, city_image_url')
      
      const airportImageMap = new Map(airports?.map(a => [a.iata_code, a.city_image_url]) || [])

      // Try to get deals from selected city first
      let { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('from_airport_city', selectedCity)
        .order('deal_found_date', { ascending: false })
        .limit(3)
      
      // If no deals from that city, get most recent overall
      if (!deals || deals.length === 0) {
        const { data: recentDeals } = await supabase
          .from('deals')
          .select('*')
          .order('deal_found_date', { ascending: false })
          .limit(3)
        
        deals = recentDeals
      }

      // Add destination images
      if (deals) {
        const dealsWithImages = deals.map(deal => ({
          ...deal,
          destination_city_image: deal.to_airport_code ? 
            airportImageMap.get(deal.to_airport_code) : 
            (deal.destination_airport ? airportImageMap.get(deal.destination_airport) : null)
        }))
        setDeals(dealsWithImages)
      }

      setLoading(false)
    }

    fetchDeals()
  }, [])

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="font-bold mb-4">Loading recent deals...</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="text-right">
                  <div className="h-5 bg-gray-200 rounded w-16 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!deals || deals.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="font-bold mb-4">
        {deals && deals.length > 0 && deals[0].from_airport_city === cityName 
          ? `Latest Flight Deals Members From ${cityName} Received`
          : `Latest Flight Deals Available`
        }
      </h3>
      <div className="space-y-3">
        {deals.map((deal) => (
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