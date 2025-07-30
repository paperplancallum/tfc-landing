import { createClient } from '@/lib/supabase/server'

export default async function TestDB() {
  const supabase = await createClient()
  
  // Test query to see what's available
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('*')
    .limit(3)

  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .limit(3)

  const { data: airports, error: airportsError } = await supabase
    .from('airports')
    .select('*')
    .limit(10)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cities Table:</h2>
        {citiesError ? (
          <p className="text-red-600">Error: {citiesError.message}</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(cities, null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Deals Table:</h2>
        {dealsError ? (
          <p className="text-red-600">Error: {dealsError.message}</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(deals?.[0], null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Airports Table:</h2>
        {airportsError ? (
          <p className="text-red-600">Error: {airportsError.message}</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(airports?.slice(0, 3), null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}