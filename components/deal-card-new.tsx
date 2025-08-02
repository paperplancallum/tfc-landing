import Link from 'next/link'
import Image from 'next/image'
import { Lock, Calendar, Clock, ArrowRight, Plane, Crown } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { Button } from '@/components/ui/button'

interface DealCardNewProps {
  deal: {
    id: string
    deal_number?: number
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
  priority?: boolean
}

export function DealCardNew({ deal, isLocked = false, priority = false }: DealCardNewProps) {
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
  // Use deal_number if available, otherwise fall back to id
  const dealIdentifier = deal.deal_number || deal.id
  const dealUrl = `/deal/${deal.from_airport_code.toLowerCase()}-${deal.to_airport_code.toLowerCase()}-${dateString}-${dealIdentifier}`

  // Format travel month from departure date
  const getTravelMonth = () => {
    if (!deal.departure_date) return 'Flexible dates'
    const date = new Date(deal.departure_date)
    return format(date, 'MMMM yyyy')
  }

  return (
    <div className="card overflow-hidden relative flex flex-col">
      
      <Link href={isLocked ? '/join' : dealUrl} className="relative h-48 bg-gray-200 block group">
        {deal.destination_city_image ? (
          <Image
            src={deal.destination_city_image}
            alt={deal.to_airport_city || deal.to_airport_code}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:opacity-90 transition-opacity"
            loading={priority ? "eager" : "lazy"}
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
      </Link>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-gray-600">
            {deal.from_airport_city || deal.from_airport_code} → {deal.to_airport_city || deal.to_airport_code}
          </p>
          <Link href={isLocked ? '/join' : dealUrl} className="text-lg font-bold text-primary hover:text-primary/80 transition-colors">
            {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency === 'EUR' ? '€' : deal.currency}
            {deal.price ? (
              // All prices are stored in cents/pence
              Math.floor(deal.price / 100)
            ) : 'TBD'}
          </Link>
        </div>
        
        <Link href={isLocked ? '/join' : dealUrl} className="block mb-3">
          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
            {deal.to_airport_city || deal.to_airport_code}
          </h3>
        </Link>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Plane size={16} />
            <span>{getTravelMonth()}</span>
          </div>
          {deal.trip_duration && deal.trip_duration > 0 && (
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
          <Link href="/join" className="mt-4 block" prefetch={true}>
            <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800" variant="default">
              <Lock className="mr-2 h-4 w-4" />
              Unlock Premium Deals
            </Button>
          </Link>
        ) : (
          <Link href={dealUrl} className="mt-4 block" prefetch={true}>
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