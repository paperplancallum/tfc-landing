import Link from 'next/link'
import Image from 'next/image'
import { Lock, Calendar, Clock, ArrowRight, Plane } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { Button } from '@/components/ui/button'

interface DealCardNewProps {
  deal: {
    id: string
    from_airport_code: string
    from_airport_city?: string
    to_airport_code: string
    to_airport_city?: string
    departure_date?: string
    return_date?: string
    trip_duration?: number
    price?: number
    currency: string
    airline?: string
    destination_city_image?: string
    deal_found_date: string
    created_at: string
  }
  isLocked?: boolean
}

export function DealCardNew({ deal, isLocked = false }: DealCardNewProps) {
  // Format date for URL as DDMMYYYY
  const formatDateForUrl = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getUTCDate().toString().padStart(2, '0')
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = date.getUTCFullYear()
    return `${day}${month}${year}`
  }
  
  // Use deal_found_date for the URL
  const dateString = formatDateForUrl(deal.deal_found_date)
  const dealUrl = `/deal/${deal.from_airport_code.toLowerCase()}-${deal.to_airport_code.toLowerCase()}-${dateString}`

  // Format travel month from departure date
  const getTravelMonth = () => {
    if (!deal.departure_date) return 'Flexible dates'
    const date = new Date(deal.departure_date)
    return format(date, 'MMMM yyyy')
  }

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
        {deal.destination_city_image ? (
          <Image
            src={deal.destination_city_image}
            alt={deal.to_airport_city || deal.to_airport_code}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Plane size={48} />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            {deal.from_airport_city || deal.from_airport_code} → {deal.to_airport_city || deal.to_airport_code}
          </p>
          {deal.airline && (
            <span className="text-xs text-gray-500">{deal.airline}</span>
          )}
        </div>
        
        <h3 className="font-semibold text-lg mb-2">
          {deal.to_airport_city || deal.to_airport_code}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">
            {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency === 'EUR' ? '€' : deal.currency}
            {deal.price || 'TBD'}
          </span>
          {deal.trip_duration && (
            <span className="text-sm text-gray-600">
              {deal.trip_duration} {deal.trip_duration === 1 ? 'day' : 'days'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{getTravelMonth()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{formatDistanceToNow(new Date(deal.created_at))} ago</span>
          </div>
        </div>
        
        {deal.departure_date && deal.return_date && (
          <div className="mt-2 text-xs text-gray-500">
            {format(new Date(deal.departure_date), 'MMM d')} - {format(new Date(deal.return_date), 'MMM d, yyyy')}
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