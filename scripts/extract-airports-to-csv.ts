import fs from 'fs'
import path from 'path'

// Read the SQL migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '014_import_airports_from_csv.sql')
const sqlContent = fs.readFileSync(migrationPath, 'utf8')

// Extract INSERT VALUES data
const insertMatch = sqlContent.match(/INSERT INTO airports \(iata_code, name, city_name, is_primary\) VALUES\s*([\s\S]*?);/m)

if (!insertMatch) {
  console.error('Could not find INSERT statement')
  process.exit(1)
}

const valuesSection = insertMatch[1]

// Parse each row - handling multiline entries and quotes
const rows = valuesSection
  .split(/\),\s*\n/)
  .map(row => row.trim())
  .filter(row => row.startsWith('('))
  .map(row => {
    // Remove parentheses and parse values
    const cleanRow = row.replace(/^\(/, '').replace(/\)$/, '')
    
    // Use regex to properly parse quoted values
    const matches = cleanRow.match(/'([^']+)'|([^,]+)/g)
    if (!matches || matches.length < 4) return null
    
    const values = matches.map(v => v.replace(/^'|'$/g, '').trim())
    
    return {
      iata_code: values[0],
      name: values[1].replace(/\\''/g, "'"), // Handle escaped quotes
      city_name: values[2].replace(/\\''/g, "'"),
      is_primary: values[3] === 'true'
    }
  })
  .filter(row => row !== null)

// Add region data from our previous script
const cityToRegion: Record<string, string> = {
  // North America
  'New York': 'North America',
  'Los Angeles': 'North America',
  'Chicago': 'North America',
  'Atlanta': 'North America',
  'Dallas': 'North America',
  'Denver': 'North America',
  'San Francisco': 'North America',
  'Seattle': 'North America',
  'Las Vegas': 'North America',
  'Orlando': 'North America',
  'Miami': 'North America',
  'Charlotte': 'North America',
  'Phoenix': 'North America',
  'Houston': 'North America',
  'Boston': 'North America',
  'Minneapolis': 'North America',
  'Detroit': 'North America',
  'Fort Lauderdale': 'North America',
  'Philadelphia': 'North America',
  'Newark': 'North America',
  'Washington': 'North America',
  'Oakland': 'North America',
  'San Jose': 'North America',
  'Burbank': 'North America',
  'Austin': 'North America',
  'Nashville': 'North America',
  'New Orleans': 'North America',
  'Raleigh': 'North America',
  'Kansas City': 'North America',
  'Sacramento': 'North America',
  'Salt Lake City': 'North America',
  'St. Louis': 'North America',
  'Tampa': 'North America',
  'Portland': 'North America',
  'Cincinnati': 'North America',
  'Pittsburgh': 'North America',
  'Milwaukee': 'North America',
  'Cleveland': 'North America',
  'San Antonio': 'North America',
  'Santa Ana': 'North America',
  'Indianapolis': 'North America',
  'Jacksonville': 'North America',
  'Columbus': 'North America',
  'Ontario': 'North America',
  'Hartford': 'North America',
  'Albuquerque': 'North America',
  'Buffalo': 'North America',
  'Omaha': 'North America',
  'Tulsa': 'North America',
  'Oklahoma City': 'North America',
  'Providence': 'North America',
  'Richmond': 'North America',
  'Memphis': 'North America',
  'Grand Rapids': 'North America',
  'Boise': 'North America',
  'Tucson': 'North America',
  'Birmingham': 'North America',
  'Des Moines': 'North America',
  'Rochester': 'North America',
  'Little Rock': 'North America',
  'Spokane': 'North America',
  'Norfolk': 'North America',
  'Dayton': 'North America',
  'Greensboro': 'North America',
  'Madison': 'North America',
  'Charleston': 'North America',
  'Knoxville': 'North America',
  'Syracuse': 'North America',
  'Reno': 'North America',
  'Fresno': 'North America',
  'Baton Rouge': 'North America',
  'Albany': 'North America',
  'Jackson': 'North America',
  'Louisville': 'North America',
  'Columbia': 'North America',
  'Harrisburg': 'North America',
  'Greenville': 'North America',
  'South Bend': 'North America',
  'Fayetteville': 'North America',
  'Savannah': 'North America',
  'Fort Wayne': 'North America',
  'Bristol': 'North America',
  'Lexington': 'North America',
  'Fargo': 'North America',
  'Huntsville': 'North America',
  'Lincoln': 'North America',
  'Pensacola': 'North America',
  'Mobile': 'North America',
  'Sioux Falls': 'North America',
  'Moline': 'North America',
  'Akron': 'North America',
  'Evansville': 'North America',
  'Appleton': 'North America',
  'Cedar Rapids': 'North America',
  'Springfield': 'North America',
  'Melbourne': 'North America',
  'Minot': 'North America',
  'Billings': 'North America',
  'Rapid City': 'North America',
  'Saginaw': 'North America',
  'La Crosse': 'North America',
  'Green Bay': 'North America',
  'Bismarck': 'North America',
  'Grand Forks': 'North America',
  'Missoula': 'North America',
  'Great Falls': 'North America',
  'Cheyenne': 'North America',
  'Champaign': 'North America',
  'Bloomington': 'North America',
  'Lansing': 'North America',
  'Wausau': 'North America',
  'Hibbing': 'North America',
  'Iron Mountain': 'North America',
  'Kalamazoo': 'North America',
  'Bemidji': 'North America',
  'Brainerd': 'North America',
  'International Falls': 'North America',
  'Newburgh': 'North America',
  'Bangor': 'North America',
  'Burlington': 'North America',
  'Manchester': 'North America',
  'Worcester': 'North America',
  "Martha's Vineyard": 'North America',
  'Nantucket': 'North America',
  'Hyannis': 'North America',
  'New Bedford': 'North America',
  'Bedford': 'North America',
  'Portsmouth': 'North America',
  'Lebanon': 'North America',
  'Rutland': 'North America',
  'Augusta': 'North America',
  'Presque Isle': 'North America',
  'Rockland': 'North America',
  'New Haven': 'North America',
  
  // US territories
  'Honolulu': 'North America',
  'Maui': 'North America',
  'Kona': 'North America',
  'Kauai': 'North America',
  'Hilo': 'North America',
  'San Juan': 'North America',
  'Ponce': 'North America',
  'Aguadilla': 'North America',
  'Guam': 'North America',
  
  // Alaska
  'Anchorage': 'North America',
  'Fairbanks': 'North America',
  'Juneau': 'North America',
  'Sitka': 'North America',
  'Ketchikan': 'North America',
  'Kodiak': 'North America',
  'Bethel': 'North America',
  'Nome': 'North America',
  'Kotzebue': 'North America',
  'Barrow': 'North America',
  'Deadhorse': 'North America',
  'Unalaska': 'North America',
  'Cordova': 'North America',
  'Yakutat': 'North America',
  'Wrangell': 'North America',
  'Petersburg': 'North America',
  'Koyuk': 'North America',
  'Dillingham': 'North America',
  'King Salmon': 'North America',

  // Europe - UK
  'London': 'Europe',
  'Manchester': 'Europe',
  'Edinburgh': 'Europe',
  'Birmingham': 'Europe',
  'Glasgow': 'Europe',
  'Bristol': 'Europe',
  'Newcastle': 'Europe',
  'Liverpool': 'Europe',
  'Belfast': 'Europe',
  'Leeds': 'Europe',
  'Nottingham': 'Europe',
  'Aberdeen': 'Europe',
  'Southampton': 'Europe',
  'Exeter': 'Europe',
  'Cardiff': 'Europe',
  'Norwich': 'Europe',
  'Dundee': 'Europe',
  'Benbecula': 'Europe',
  'Campbeltown': 'Europe',
  'Isles of Scilly': 'Europe',
  "Land's End": 'Europe',
  'Papa Westray': 'Europe',
  'Wick': 'Europe',

  // Europe - Major cities
  'Paris': 'Europe',
  'Amsterdam': 'Europe',
  'Frankfurt': 'Europe',
  'Madrid': 'Europe',
  'Barcelona': 'Europe',
  'Rome': 'Europe',
  'Milan': 'Europe',
  'Munich': 'Europe',
  'Berlin': 'Europe',
  'Zurich': 'Europe',
  'Geneva': 'Europe',
  'Vienna': 'Europe',
  'Brussels': 'Europe',
  'Copenhagen': 'Europe',
  'Oslo': 'Europe',
  'Stockholm': 'Europe',
  'Helsinki': 'Europe',
  'Dublin': 'Europe',
  'Lisbon': 'Europe',
  'Porto': 'Europe',
  'Athens': 'Europe',
  'Istanbul': 'Europe',
  'Warsaw': 'Europe',
  'Prague': 'Europe',
  'Budapest': 'Europe',
  'Bucharest': 'Europe',
  'Belgrade': 'Europe',
  'Zagreb': 'Europe',
  'Sofia': 'Europe',
  
  // More European cities
  'Lyon': 'Europe',
  'Marseille': 'Europe',
  'Nice': 'Europe',
  'Toulouse': 'Europe',
  'Bordeaux': 'Europe',
  'Venice': 'Europe',
  'Naples': 'Europe',
  'Florence': 'Europe',
  'Bologna': 'Europe',
  'Turin': 'Europe',
  'Düsseldorf': 'Europe',
  'Hamburg': 'Europe',
  'Cologne': 'Europe',
  'Stuttgart': 'Europe',
  'Valencia': 'Europe',
  'Málaga': 'Europe',
  'Seville': 'Europe',
  'Bilbao': 'Europe',
  'Palma': 'Europe',
  'Ibiza': 'Europe',
  'Tenerife': 'Europe',
  'Las Palmas': 'Europe',
  'Faro': 'Europe',
  'Basel': 'Europe',
  'Bern': 'Europe',
  'Gothenburg': 'Europe',
  'Malmö': 'Europe',
  'Bergen': 'Europe',
  'Reykjavík': 'Europe',
  'Tallinn': 'Europe',
  'Riga': 'Europe',
  'Vilnius': 'Europe'
}

// Create CSV content
const csvHeader = 'iata_code,name,city_name,region,is_primary\n'
const csvRows = rows.map(row => {
  const region = cityToRegion[row!.city_name] || 'Unknown'
  return `${row!.iata_code},"${row!.name}","${row!.city_name}",${region},${row!.is_primary}`
}).join('\n')

const csvContent = csvHeader + csvRows

// Write to file
const outputPath = path.join(__dirname, '..', 'data', 'airports.csv')
const dataDir = path.dirname(outputPath)

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

fs.writeFileSync(outputPath, csvContent)

console.log(`Successfully extracted ${rows.length} airports to ${outputPath}`)

// Also create a JSON file for easier use
const jsonData = rows.map(row => ({
  ...row,
  region: cityToRegion[row!.city_name] || 'Unknown'
}))

const jsonPath = path.join(__dirname, '..', 'data', 'airports.json')
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2))

console.log(`Also created JSON file at ${jsonPath}`)

// Print summary
const regionCounts: Record<string, number> = {}
jsonData.forEach(airport => {
  regionCounts[airport.region] = (regionCounts[airport.region] || 0) + 1
})

console.log('\nAirport distribution by region:')
Object.entries(regionCounts).forEach(([region, count]) => {
  console.log(`${region}: ${count} airports`)
})