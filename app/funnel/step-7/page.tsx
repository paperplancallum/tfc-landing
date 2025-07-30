import { createClient } from '@/lib/supabase/server'
import { AirportSelector } from './airport-selector'

export default async function FunnelStep7() {
  const supabase = await createClient()
  
  // Fetch all airports from the airports table
  const { data: airportsData, error: airportsError } = await supabase
    .from('airports')
    .select('*')
    .order('name', { ascending: true })

  if (airportsError) {
    console.error('Error loading airports:', airportsError)
  }

  // Transform airports data to match the expected format
  const airports = airportsData?.map(airport => ({
    id: airport.id,
    iata_code: airport.iata_code || airport.code || 'XXX',
    name: airport.name || airport.city || 'Unknown Airport',
    city: airport.city || airport.name || 'Unknown City',
    country: airport.country || 'Unknown'
  })) || []

  console.log(`Loaded ${airports.length} airports`)

  if (airports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center">
        <p className="text-red-600">No airports found in database.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <AirportSelector airports={airports} />
    </div>
  )
}