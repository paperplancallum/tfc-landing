import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, MapPin, Users, ExternalLink, Plane } from 'lucide-react'
import { format } from 'date-fns'

interface DealPageProps {
  params: Promise<{ slug: string }>
}

export default async function DealPage({ params }: DealPageProps) {
  const { slug } = await params
  
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables not configured')
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Configuration Error</h1>
        <p>Supabase is not configured properly.</p>
      </div>
    )
  }
  
  const supabase = await createClient()
  
  console.log('Deal page - slug:', slug)
  
  // Parse the slug: lhr-bcn-28072025
  const parts = slug.split('-')
  if (parts.length !== 3) {
    console.log('Invalid slug format - parts:', parts)
    notFound()
  }
  
  const [departureAirport, destinationAirport, dateStr] = parts
  
  // Parse date from DDMMYYYY format
  const day = dateStr.substring(0, 2)
  const month = dateStr.substring(2, 4)
  const year = dateStr.substring(4, 8)
  const searchDate = `${year}-${month}-${day}`
  
  console.log('Parsed values:', {
    departureAirport,
    destinationAirport,
    dateStr,
    searchDate
  })
  
  // Get destination city name from airports table
  const { data: destinationAirportData } = await supabase
    .from('airports')
    .select('city_name')
    .eq('iata_code', destinationAirport.toUpperCase())
    .single()
  
  const destinationCity = destinationAirportData?.city_name || ''
  
  console.log('Destination lookup:', {
    destinationAirport,
    destinationCity,
    airportData: destinationAirportData
  })
  
  // Debug: Check what deals exist for this route
  const { data: debugDeals } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', departureAirport.toUpperCase())
    .eq('to_airport_code', destinationAirport.toUpperCase())
    .order('deal_found_date', { ascending: false })
    .limit(5)
    
  console.log('Debug - All deals for this route:', debugDeals?.map(d => ({
    id: d.id,
    from: `${d.from_airport_code} (${d.from_airport_city})`,
    to: `${d.to_airport_code} (${d.to_airport_city})`,
    price: d.price,
    date: d.deal_found_date
  })))
  
  // Get the deal using airport codes which are more reliable than city names
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .eq('from_airport_code', departureAirport.toUpperCase())
    .eq('to_airport_code', destinationAirport.toUpperCase())
    .gte('deal_found_date', searchDate)
    .lte('deal_found_date', searchDate)
    .order('created_at', { ascending: true })
    
  console.log('Deal query:', {
    from_airport_code: departureAirport.toUpperCase(),
    to_airport_code: destinationAirport.toUpperCase(),
    searchDate,
    found: deals?.length || 0,
    error: dealsError
  })
    
  if (!deals || deals.length === 0) {
    console.log('No deals found')
    // Return a debug page instead of 404 for now
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">No Deal Found</h1>
        <p>Query parameters:</p>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {JSON.stringify({
            from_airport_code: departureAirport.toUpperCase(),
            to_airport_code: destinationAirport.toUpperCase(),
            destination_city: destinationCity,
            searchDate,
            error: dealsError
          }, null, 2)}
        </pre>
      </div>
    )
  }
  
  // Take the first deal if multiple exist for the same date
  const deal = deals[0]
  
  // Get the destination city image from airports table
  const { data: airportData } = await supabase
    .from('airports')
    .select('city_image_url')
    .eq('iata_code', deal.to_airport_code || destinationAirport.toUpperCase())
    .single()
  
  const destinationCityImage = airportData?.city_image_url
  
  // Check if user has access to premium deals
  const { data: { user } } = await supabase.auth.getUser()
  let canViewPremium = false
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
      
    canViewPremium = profile?.plan === 'premium'
  }
  
  // If it's a premium deal and user doesn't have access, redirect to join page
  // Note: New structure doesn't have is_premium field, so we'll skip this check for now
  if (false && !canViewPremium) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Premium Deal</h1>
          <p className="text-gray-600 mb-8">This deal is only available to premium members</p>
          <Link href="/join">
            <Button size="lg">Become a Premium Member</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link href={`/deals/${(deal.from_airport_city || 'all').toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex mb-6">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to deals
            </Button>
          </Link>
          
          {/* Hero Image */}
          <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
            {destinationCityImage ? (
              <Image
                src={destinationCityImage}
                alt={deal.to_airport_city || deal.to_airport_code}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>No image available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          {/* Deal Info */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{deal.to_airport_city || deal.to_airport_code}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin size={20} />
                From {deal.from_airport_city || deal.from_airport_code}
              </p>
              <div className="text-4xl font-bold text-primary mt-4">
                {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency === 'EUR' ? '€' : deal.currency}
                {deal.price ? (
                  // EUR prices are stored in cents, GBP prices are stored as whole numbers
                  deal.currency === 'EUR' ? Math.floor(deal.price / 100) : Math.floor(deal.price)
                ) : 'TBD'}
              </div>
            </div>
            
            {/* Deal Details */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Travel Dates</p>
                  <p className="font-semibold">
                    {deal.departure_date && deal.return_date
                      ? canViewPremium 
                        ? `${format(new Date(deal.departure_date), 'MMM d')} - ${format(new Date(deal.return_date), 'MMM d, yyyy')}`
                        : format(new Date(deal.departure_date), 'MMMM yyyy')
                      : 'Flexible dates'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Trip Length</p>
                  <p className="font-semibold">{deal.trip_duration || 'Flexible'} {deal.trip_duration === 1 ? 'day' : 'days'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Found</p>
                  <p className="font-semibold">{format(new Date(deal.deal_found_date || deal.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Plane className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Trip Type</p>
                  <p className="font-semibold">Return trip</p>
                </div>
              </div>
            </div>
            
            
            {/* CTA */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Ready to Book?</h2>
              <p className="text-gray-600 mb-6">
                Click below to search for this deal on flight booking sites. Prices and availability may vary.
              </p>
              {deal.deal_url ? (
                <a href={deal.deal_url} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full md:w-auto">
                    Book Flights
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Button size="lg" className="w-full md:w-auto" disabled>
                  Book Flights (No link available)
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-4">Important Information</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• All prices shown are for return flights</li>
              <li>• Prices shown are estimates based on when the deal was found</li>
              <li>• Actual prices may vary depending on dates, availability, and booking site</li>
              <li>• We recommend booking as soon as possible for the best rates</li>
              <li>• This deal was found on {format(new Date(deal.deal_found_date || deal.created_at), 'MMMM d, yyyy')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}