import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import * as path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface AirportCSVRow {
  'Airport Code': string
  'Airport Name': string
  'Airport City': string
  'Airport Country': string
}

interface AirportInsert {
  iata_code: string
  name: string
  city_name: string
  is_primary: boolean
}

// Function to determine if an airport should be marked as primary
function isPrimaryAirport(airportCode: string, cityName: string, airportsInCity: AirportCSVRow[]): boolean {
  // If it's the only airport in the city, it's primary
  if (airportsInCity.length === 1) {
    return true
  }

  // Define primary airports for cities with multiple airports
  const primaryAirportCodes: Record<string, string> = {
    'London': 'LHR',
    'Paris': 'CDG',
    'New York': 'JFK',
    'Los Angeles': 'LAX',
    'Chicago': 'ORD',
    'Miami': 'MIA',
    'Washington': 'DCA',
    'San Francisco': 'SFO',
    'Dallas': 'DFW',
    'Houston': 'IAH',
    'Rome': 'FCO',
    'Milan': 'MXP',
    'Berlin': 'BER',
    'Frankfurt': 'FRA',
    'Amsterdam': 'AMS',
    'Madrid': 'MAD',
    'Barcelona': 'BCN',
    'Dublin': 'DUB',
    'Stockholm': 'ARN',
    'Oslo': 'OSL',
    'Copenhagen': 'CPH',
  }

  return primaryAirportCodes[cityName] === airportCode
}

async function importAirports() {
  try {
    console.log('Reading airports.csv file...')
    const csvPath = path.join(__dirname, '..', 'airports.csv')
    const fileContent = readFileSync(csvPath, 'utf-8')
    
    console.log('Parsing CSV data...')
    const records: AirportCSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    console.log(`Found ${records.length} airports in CSV file`)

    // Group airports by city to determine primary airports
    const airportsByCity: Record<string, AirportCSVRow[]> = {}
    records.forEach(record => {
      const city = record['Airport City']
      if (!airportsByCity[city]) {
        airportsByCity[city] = []
      }
      airportsByCity[city].push(record)
    })

    // Prepare airport data for insertion
    const airportsToInsert: AirportInsert[] = records.map(record => ({
      iata_code: record['Airport Code'],
      name: record['Airport Name'],
      city_name: record['Airport City'],
      is_primary: isPrimaryAirport(
        record['Airport Code'], 
        record['Airport City'], 
        airportsByCity[record['Airport City']]
      )
    }))

    console.log('Backing up existing airport-deal relationships...')
    // Get existing deal-airport relationships
    const { data: dealAirports, error: dealError } = await supabase
      .from('deals')
      .select('id, departure_airport_id, airports!inner(iata_code)')
      .not('departure_airport_id', 'is', null)

    if (dealError) {
      console.error('Error backing up deal-airport relationships:', dealError)
    } else {
      console.log(`Found ${dealAirports?.length || 0} deal-airport relationships`)
    }

    // Store the mapping of deal_id to airport IATA code
    const dealAirportMapping = dealAirports?.map(deal => ({
      dealId: deal.id,
      iataCode: (deal.airports as any).iata_code
    })) || []

    console.log('Clearing existing airport data...')
    // Clear existing airports
    const { error: deleteError } = await supabase
      .from('airports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (deleteError) {
      console.error('Error clearing airports:', deleteError)
      throw deleteError
    }

    console.log('Inserting new airports...')
    // Insert airports in batches of 100
    const batchSize = 100
    for (let i = 0; i < airportsToInsert.length; i += batchSize) {
      const batch = airportsToInsert.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('airports')
        .insert(batch)

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError)
        throw insertError
      }

      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(airportsToInsert.length / batchSize)}`)
    }

    console.log('Updating city_id relationships...')
    // Update city_id relationships where cities exist
    const { data: cities } = await supabase
      .from('cities')
      .select('id, name')

    if (cities) {
      for (const city of cities) {
        const { error: updateError } = await supabase
          .from('airports')
          .update({ city_id: city.id })
          .eq('city_name', city.name)

        if (updateError) {
          console.error(`Error updating city_id for ${city.name}:`, updateError)
        }
      }
    }

    console.log('Restoring deal-airport relationships...')
    // Restore deal-airport relationships
    for (const mapping of dealAirportMapping) {
      // Find the new airport ID for the IATA code
      const { data: airport } = await supabase
        .from('airports')
        .select('id')
        .eq('iata_code', mapping.iataCode)
        .single()

      if (airport) {
        const { error: updateError } = await supabase
          .from('deals')
          .update({ departure_airport_id: airport.id })
          .eq('id', mapping.dealId)

        if (updateError) {
          console.error(`Error restoring deal-airport relationship for deal ${mapping.dealId}:`, updateError)
        }
      }
    }

    console.log('Import completed successfully!')
    
    // Verify the import
    const { count } = await supabase
      .from('airports')
      .select('*', { count: 'exact', head: true })

    console.log(`Total airports in database: ${count}`)

  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importAirports()