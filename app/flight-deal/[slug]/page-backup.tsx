import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

interface DealPageProps {
  params: { slug: string }
}

export default async function DealPage({ params }: DealPageProps) {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase not configured')
    notFound()
  }
  
  const supabase = await createClient()
  
  console.log('Deal page - slug:', params.slug)
  
  // Parse the slug: lon-bcn-28072025
  const parts = params.slug.split('-')
  if (parts.length !== 3) {
    console.log('Invalid slug format - parts:', parts)
    notFound()
  }
  
  const [departureCode, destinationCode, dateStr] = parts
  
  // Parse date from DDMMYYYY format
  const day = dateStr.substring(0, 2)
  const month = dateStr.substring(2, 4)
  const year = dateStr.substring(4, 8)
  const searchDate = `${year}-${month}-${day}`
  
  console.log('Parsed values:', {
    departureCode,
    destinationCode,
    dateStr,
    searchDate
  })
  
  // Map airport codes to city codes
  const airportToCityMap: { [key: string]: string } = {
    // London airports
    'LHR': 'LON', 'LGW': 'LON', 'STN': 'LON', 'LTN': 'LON', 'LCY': 'LON',
    // New York airports
    'JFK': 'NYC', 'LGA': 'NYC', 'EWR': 'NYC',
    // Los Angeles airports
    'LAX': 'LAX', 'BUR': 'LAX', 'LGB': 'LAX', 'SNA': 'LAX',
    // Miami airports
    'MIA': 'MIA', 'FLL': 'MIA', 'PBI': 'MIA',
    // Paris airports
    'CDG': 'PAR', 'ORY': 'PAR',
    // Tokyo airports
    'NRT': 'TYO', 'HND': 'TYO'
  }
  
  // Check if it's an airport code and convert to city code
  const departureCodeUpper = departureCode.toUpperCase()
  const cityCode = airportToCityMap[departureCodeUpper] || departureCodeUpper
  
  console.log('City lookup:', {
    departureCode,
    departureCodeUpper,
    cityCode
  })
  
  // Get city by code
  const { data: departureCity, error: cityError } = await supabase
    .from('cities')
    .select('*')
    .eq('iata_code', cityCode)
    .single()
    
  if (cityError) {
    console.log('City lookup error:', cityError)
  }
    
  if (!departureCity) {
    console.log('City not found for code:', cityCode)
    notFound()
  }
  
  console.log('Found city:', departureCity)
  
  // Map destination codes to city names for the query
  const destinationMap: { [key: string]: string } = {
    'bcn': 'Barcelona',
    'ams': 'Amsterdam',
    'rom': 'Rome',
    'nrt': 'Tokyo',
    'nyc': 'New York',
    'jfk': 'New York',
    'lga': 'New York',
    'ewr': 'New York',
    'dxb': 'Dubai',
    'syd': 'Sydney',
    'bkk': 'Bangkok',
    'sin': 'Singapore',
    'par': 'Paris',
    'cdg': 'Paris',
    'ory': 'Paris',
    'lon': 'London',
    'lhr': 'London',
    'lgw': 'London',
    'stn': 'London',
    'ltn': 'London',
    'lcy': 'London',
    'lax': 'Los Angeles',
    'bur': 'Los Angeles',
    'lgb': 'Los Angeles',
    'sna': 'Los Angeles',
    'mia': 'Miami',
    'fll': 'Miami',
    'pbi': 'Miami',
    'tyo': 'Tokyo',
    'hnd': 'Tokyo',
    'fco': 'Rome'
  }
  
  const destinationCity = destinationMap[destinationCode.toLowerCase()] || ''
  
  console.log('Destination lookup:', {
    destinationCode,
    destinationCity
  })
  
  // Get the deal
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .eq('departure_city_id', departureCity.id)
    .ilike('destination', `${destinationCity}%`)
    .gte('found_at', `${searchDate}T00:00:00`)
    .lte('found_at', `${searchDate}T23:59:59`)
    .order('found_at', { ascending: true })
    
  console.log('Deal query:', {
    departure_city_id: departureCity.id,
    destination: `${destinationCity}%`,
    searchDate,
    found: deals?.length || 0,
    error: dealsError
  })
    
  if (!deals || deals.length === 0) {
    console.log('No deals found')
    notFound()
  }
  
  // Take the first deal if multiple exist for the same date
  const deal = deals[0]
  
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
  if (deal.is_premium && !canViewPremium) {
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
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-200">
        {deal.photo_url ? (
          <Image
            src={deal.photo_url}
            alt={deal.destination}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span>No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back button */}
        <Link href={`/deals/${departureCity.name.toLowerCase().replace(/\s+/g, '-')}`} className="absolute top-4 left-4">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to deals
          </Button>
        </Link>
      </div>
      
      {/* Deal Info */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{deal.destination}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin size={20} />
                  From {departureCity.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : deal.currency}
                  {deal.price}
                </div>
                <p className="text-gray-600">per person (return)</p>
              </div>
            </div>
            
            {/* Deal Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Travel Month</p>
                  <p className="font-semibold">{deal.travel_month}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Trip Length</p>
                  <p className="font-semibold">{deal.trip_length} days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="text-gray-400" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Found</p>
                  <p className="font-semibold">{format(new Date(deal.found_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Ready to Book?</h2>
              <p className="text-gray-600 mb-6">
                Click below to search for this deal on flight booking sites. Prices and availability may vary.
              </p>
              <Button size="lg" className="w-full md:w-auto">
                Book Flights
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {/* Premium Badge */}
            {deal.is_premium && (
              <div className="mt-6 inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded">
                Premium Deal
              </div>
            )}
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-4">Important Information</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• All prices shown are for return flights</li>
              <li>• Prices shown are estimates based on when the deal was found</li>
              <li>• Actual prices may vary depending on dates, availability, and booking site</li>
              <li>• We recommend booking as soon as possible for the best rates</li>
              <li>• This deal was found on {format(new Date(deal.found_at), 'MMMM d, yyyy')}</li>
              {deal.expires_at && (
                <li>• Deal expires on {format(new Date(deal.expires_at), 'MMMM d, yyyy')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}