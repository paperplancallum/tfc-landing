import Link from 'next/link'
import Image from 'next/image'
import { Lock, Calendar, Clock, ArrowRight, Plane, Crown } from 'lucide-react'
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
        {isLocked && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Crown size={16} />
            <span className="text-sm font-semibold">Premium</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-gray-600">
            {deal.from_airport_city || deal.from_airport_code} → {deal.to_airport_city || deal.to_airport_code}
          </p>
          <span className="text-lg font-bold text-primary">
            {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency === 'EUR' ? '€' : deal.currency}
            {deal.price ? (
              // EUR prices are stored in cents, GBP prices are stored as whole numbers
              deal.currency === 'EUR' ? Math.floor(deal.price / 100) : Math.floor(deal.price)
            ) : 'TBD'}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-3">
          {deal.to_airport_city || deal.to_airport_code}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Plane size={16} />
            <span>{getTravelMonth()}</span>
          </div>
          {deal.trip_duration && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar size={16} />
              <span>Trip duration: {deal.trip_duration} {deal.trip_duration === 1 ? 'day' : 'days'}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={16} />
            <span>Deal found {formatDistanceToNow(new Date(deal.created_at))} ago</span>
          </div>
        </div>
        
        {isLocked ? (
          <Link href="/join" className="mt-4 block">
            <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800" variant="default">
              <Lock className="mr-2 h-4 w-4" />
              Unlock Premium Deals
            </Button>
          </Link>
        ) : (
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