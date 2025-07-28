import { createClient } from '@/lib/supabase/server'

export default async function TestDealPage() {
  const supabase = await createClient()
  
  const slug = 'lhr-bcn-28072025'
  const parts = slug.split('-')
  const [departureAirport, destinationAirport, dateStr] = parts
  
  // Parse date from DDMMYYYY format
  const day = dateStr.substring(0, 2)
  const month = dateStr.substring(2, 4)
  const year = dateStr.substring(4, 8)
  const searchDate = `${year}-${month}-${day}`
  
  // Test the exact query
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .eq('departure_airport', 'LHR')
    .ilike('destination_city', '%Barcelona%')
    .gte('found_at', `${searchDate}T00:00:00`)
    .lte('found_at', `${searchDate}T23:59:59`)
    
  // Also get all Barcelona deals
  const { data: allDeals } = await supabase
    .from('deals')
    .select('*')
    .eq('departure_airport', 'LHR')
    .ilike('destination_city', '%Barcelona%')
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Deal Query Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Query Parameters:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({
            slug,
            departureAirport,
            destinationAirport,
            dateStr,
            searchDate,
            dateRange: {
              from: `${searchDate}T00:00:00`,
              to: `${searchDate}T23:59:59`
            }
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Query Results (with date filter):</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ count: deals?.length || 0, error, deals }, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Barcelona Deals from LHR:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(allDeals?.map(d => ({
            id: d.id,
            found_at: d.found_at,
            formatted_date: new Date(d.found_at).toISOString().split('T')[0],
            url_format: (() => {
              const date = new Date(d.found_at)
              const day = date.getDate().toString().padStart(2, '0')
              const month = (date.getMonth() + 1).toString().padStart(2, '0')
              const year = date.getFullYear()
              return `${day}${month}${year}`
            })()
          })), null, 2)}
        </pre>
      </div>
    </div>
  )
}