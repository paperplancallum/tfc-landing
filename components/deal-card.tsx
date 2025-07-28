import Link from 'next/link'
import Image from 'next/image'
import { Lock, Calendar, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'

interface DealCardProps {
  deal: {
    id: string
    destination: string
    price: number
    currency: string
    trip_length: number
    travel_month: string
    photo_url: string | null
    is_premium: boolean
    found_at: string
    departure_city_id?: string
  }
  isLocked: boolean
  departureCity?: string
  departureCityName?: string
}

export function DealCard({ deal, isLocked, departureCity = 'lon', departureCityName }: DealCardProps) {
  // Map city codes to primary airport codes
  const cityToAirportMap: { [key: string]: string } = {
    'lon': 'lhr',  // London -> Heathrow (primary airport)
    'nyc': 'jfk',  // New York -> JFK (primary airport)
    'lax': 'lax',  // Los Angeles International
    'mia': 'mia',  // Miami International
    'par': 'cdg',  // Paris -> Charles de Gaulle (primary airport)
    'tyo': 'nrt',  // Tokyo -> Narita (primary airport)
    'syd': 'syd',  // Sydney
    'bkk': 'bkk',  // Bangkok
    'ams': 'ams',  // Amsterdam
    'rom': 'fco',  // Rome -> Fiumicino (primary airport)
    'dxb': 'dxb',  // Dubai
    'sin': 'sin'   // Singapore
  }
  
  // Use the primary airport code if we have a city code, otherwise use as-is
  const actualDepartureCode = cityToAirportMap[departureCity] || departureCity;
  // Extract destination city code from destination string (e.g., "Barcelona, Spain" -> "bcn")
  const getDestinationCode = (destination: string) => {
    const cityMap: { [key: string]: string } = {
      'barcelona': 'bcn',
      'amsterdam': 'ams',
      'rome': 'rom',
      'tokyo': 'nrt',
      'new york': 'nyc',
      'dubai': 'dxb',
      'sydney': 'syd',
      'bangkok': 'bkk',
      'singapore': 'sin',
      'paris': 'par',
      'london': 'lon',
      'los angeles': 'lax',
      'miami': 'mia'
    }
    
    const city = destination.split(',')[0].toLowerCase()
    return cityMap[city] || 'xxx'
  }

  const destinationCode = getDestinationCode(deal.destination)
  
  // Format date from found_at as DDMMYYYY
  const formatDateForUrl = (dateString: string) => {
    const date = new Date(dateString)
    // Use UTC methods to avoid timezone issues
    const day = date.getUTCDate().toString().padStart(2, '0')
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = date.getUTCFullYear()
    return `${day}${month}${year}`
  }
  
  const dateString = formatDateForUrl(deal.found_at)
  const dealUrl = `/deal/${actualDepartureCode}-${destinationCode}-${dateString}`

  return (
    <div className="card overflow-hidden relative flex flex-col">
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center text-white">
          <Lock size={48} className="mb-4" />
          <p className="font-semibold mb-2">Premium Deal</p>
          <Link href="/join">
            <Button size="sm" variant="secondary">
              Become a Member
            </Button>
          </Link>
        </div>
      )}
      
      <div className="relative h-48 bg-gray-200">
        {deal.photo_url ? (
          <Image
            src={deal.photo_url}
            alt={deal.destination}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span>No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {departureCityName && (
          <p className="text-sm text-gray-600 mb-1">
            {departureCityName} → {deal.destination.split(',')[0]}
          </p>
        )}
        <h3 className="font-semibold text-lg mb-2">{deal.destination}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">
            {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency}
            {deal.price}
          </span>
          <span className="text-sm text-gray-600">
            {deal.trip_length} days
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{deal.travel_month}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{formatDistanceToNow(new Date(deal.found_at))} ago</span>
          </div>
        </div>
        
        {deal.is_premium && (
          <div className="mt-3">
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
              Premium
            </span>
          </div>
        )}
        
        {!isLocked && (
          <Link href={dealUrl} className="mt-4 block">
            <Button className="w-full" variant="outline">
              View Deal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}