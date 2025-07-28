import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface DealPageProps {
  params: Promise<{ slug: string }>
}

export default async function DealPage({ params }: DealPageProps) {
  const { slug } = await params
  
  // Parse the slug: lhr-bcn-28072025
  const parts = slug.split('-')
  if (parts.length !== 3) {
    notFound()
  }
  
  const [departureAirport, destinationAirport, dateStr] = parts
  
  // Parse date from DDMMYYYY format
  const day = dateStr.substring(0, 2)
  const month = dateStr.substring(2, 4)
  const year = dateStr.substring(4, 8)
  const searchDate = `${year}-${month}-${day}`
  
  const supabase = await createClient()
  
  // Get the deal - simplified query
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('departure_airport', 'LHR')
    .eq('destination_city', 'Barcelona')
    .gte('found_at', `${searchDate}T00:00:00`)
    .lte('found_at', `${searchDate}T23:59:59`)
    
  if (!deals || deals.length === 0) {
    notFound()
  }
  
  const deal = deals[0]
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{deal.destination_city}</h1>
      <p>From {deal.departure_city}</p>
      <p>Price: {deal.currency} {deal.price}</p>
      <p>Found: {new Date(deal.found_at).toLocaleDateString()}</p>
    </div>
  )
}