import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Define regions and their corresponding cities
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

  // Europe - France
  'Paris': 'Europe',
  'Lyon': 'Europe',
  'Marseille': 'Europe',
  'Nice': 'Europe',
  'Toulouse': 'Europe',
  'Bordeaux': 'Europe',
  'Nantes': 'Europe',
  'Lille': 'Europe',
  'Strasbourg': 'Europe',
  'Rennes': 'Europe',
  'Montpellier': 'Europe',
  'Biarritz': 'Europe',
  'Bergerac': 'Europe',
  'Toulon': 'Europe',
  'Ajaccio': 'Europe',
  'Bastia': 'Europe',
  'Figari': 'Europe',
  'Calvi': 'Europe',
  'Brest': 'Europe',
  'Mulhouse': 'Europe',
  'Perpignan': 'Europe',
  'Béziers': 'Europe',
  'Clermont-Ferrand': 'Europe',
  'Limoges': 'Europe',
  'Pau': 'Europe',
  'Rodez': 'Europe',
  'Tours': 'Europe',
  'La Rochelle': 'Europe',
  'Poitiers': 'Europe',
  'Agen': 'Europe',
  'Tarbes': 'Europe',
  'Brive': 'Europe',
  'Aurillac': 'Europe',
  'Chambéry': 'Europe',
  'Courchevel': 'Europe',
  'Grenoble': 'Europe',
  'Annecy': 'Europe',
  'Valence': 'Europe',
  'Montbéliard': 'Europe',
  'Dole': 'Europe',
  'Dijon': 'Europe',
  'Annemasse': 'Europe',
  'Vichy': 'Europe',
  'Valenciennes': 'Europe',
  'Colmar': 'Europe',
  'Metz': 'Europe',
  'Bourg': 'Europe',
  'Le Puy': 'Europe',
  'Reims': 'Europe',
  'Châlons': 'Europe',
  'Lannion': 'Europe',
  'Landivisiau': 'Europe',
  'Lorient': 'Europe',
  'Mende': 'Europe',
  'Le Touquet': 'Europe',
  'Vannes': 'Europe',
  "Île d'Yeu": 'Europe',
  'Dinard': 'Europe',
  'Saint-Brieuc': 'Europe',
  'Méribel': 'Europe',
  'Aubenas': 'Europe',
  'Carcassonne': 'Europe',
  'Castres': 'Europe',
  'Montluçon': 'Europe',
  'Albi': 'Europe',
  'Cahors': 'Europe',
  'Périgueux': 'Europe',
  'Cognac': 'Europe',
  'Niort': 'Europe',
  'Nevers': 'Europe',
  'Auxerre': 'Europe',
  'Chartres': 'Europe',
  'Albert': 'Europe',
  'Amiens': 'Europe',
  'Creil': 'Europe',
  'Angoulême': 'Europe',
  'Châteauroux': 'Europe',
  'Laval': 'Europe',
  'Avignon': 'Europe',
  'Le Castellet': 'Europe',
  'Angers': 'Europe',
  'Cannes': 'Europe',
  'Nîmes': 'Europe',
  'Saint-Tropez': 'Europe',

  // Europe - Germany
  'Frankfurt': 'Europe',
  'Munich': 'Europe',
  'Berlin': 'Europe',
  'Düsseldorf': 'Europe',
  'Hamburg': 'Europe',
  'Cologne': 'Europe',
  'Stuttgart': 'Europe',
  'Nuremberg': 'Europe',
  'Hannover': 'Europe',
  'Leipzig': 'Europe',
  'Dresden': 'Europe',
  'Bremen': 'Europe',
  'Dortmund': 'Europe',
  'Münster': 'Europe',
  'Paderborn': 'Europe',
  'Karlsruhe': 'Europe',
  'Saarbrücken': 'Europe',
  'Rostock': 'Europe',
  'Magdeburg': 'Europe',
  'Erfurt': 'Europe',
  'Heringsdorf': 'Europe',
  'Barth': 'Europe',
  'Cottbus': 'Europe',
  'Hof': 'Europe',
  'Kassel': 'Europe',
  'Lübeck': 'Europe',
  'Zweibrücken': 'Europe',
  'Friedrichshafen': 'Europe',
  'Mannheim': 'Europe',
  'Sylt': 'Europe',
  'Bayreuth': 'Europe',
  'Altenburg': 'Europe',
  'Borkum': 'Europe',
  'Baltrum': 'Europe',
  'Juist': 'Europe',
  'Langeoog': 'Europe',
  'Norden': 'Europe',
  'Norderney': 'Europe',
  'Cloppenburg': 'Europe',
  'Wilhelmshaven': 'Europe',
  'Wangerooge': 'Europe',
  'Wyk': 'Europe',
  'Wyk auf Föhr': 'Europe',
  'St. Peter-Ording': 'Europe',
  'Gütersloh': 'Europe',
  'Braunschweig': 'Europe',
  'Emden': 'Europe',
  'Kiel': 'Europe',
  'Lemwerder': 'Europe',
  'Oberpfaffenhofen': 'Europe',
  'Schwerin': 'Europe',
  'Greifswald': 'Europe',
  'Heidelberg': 'Europe',
  'Koblenz': 'Europe',
  'Bitburg': 'Europe',
  'Parchim': 'Europe',
  'Cuxhaven': 'Europe',
  'Wilberg': 'Europe',
  'Essen': 'Europe',
  'Fritzlar': 'Europe',
  'Siegen': 'Europe',
  'Bielefeld': 'Europe',
  'Celle': 'Europe',
  'Wuppertal': 'Europe',
  'Flensburg': 'Europe',

  // Europe - Italy
  'Rome': 'Europe',
  'Milan': 'Europe',
  'Venice': 'Europe',
  'Naples': 'Europe',
  'Bologna': 'Europe',
  'Florence': 'Europe',
  'Turin': 'Europe',
  'Pisa': 'Europe',
  'Cagliari': 'Europe',
  'Catania': 'Europe',
  'Palermo': 'Europe',
  'Bari': 'Europe',
  'Olbia': 'Europe',

  // Europe - Spain
  'Madrid': 'Europe',
  'Barcelona': 'Europe',
  'Alicante': 'Europe',
  'Valencia': 'Europe',
  'Málaga': 'Europe',
  'Palma': 'Europe',
  'Seville': 'Europe',
  'Bilbao': 'Europe',
  'Ibiza': 'Europe',
  'Tenerife': 'Europe',
  'Las Palmas': 'Europe',
  'Lanzarote': 'Europe',
  'Fuerteventura': 'Europe',
  'Menorca': 'Europe',
  'Almería': 'Europe',
  'Oviedo': 'Europe',
  'Santiago de Compostela': 'Europe',
  'Vigo': 'Europe',
  'A Coruña': 'Europe',
  'Girona': 'Europe',
  'Reus': 'Europe',
  'Zaragoza': 'Europe',
  'Valladolid': 'Europe',
  'Burgos': 'Europe',
  'Vitoria': 'Europe',
  'Pamplona': 'Europe',
  'Salamanca': 'Europe',
  'Badajoz': 'Europe',
  'Jerez': 'Europe',
  'Logroño': 'Europe',
  'Huesca': 'Europe',
  'Albacete': 'Europe',
  'Castellón': 'Europe',
  'El Hierro': 'Europe',
  'La Gomera': 'Europe',
  'La Palma': 'Europe',
  'Melilla': 'Europe',
  'Córdoba': 'Europe',
  'Granada': 'Europe',
  'San Sebastián': 'Europe',
  'Murcia': 'Europe',
  'Santander': 'Europe',
  'Ciudad Real': 'Europe',

  // Europe - Portugal
  'Lisbon': 'Europe',
  'Porto': 'Europe',
  'Faro': 'Europe',
  'Madeira': 'Europe',
  'Ponta Delgada': 'Europe',
  'Horta': 'Europe',
  'Pico': 'Europe',
  'Santa Maria': 'Europe',
  'Terceira': 'Europe',
  'Flores': 'Europe',
  'Corvo': 'Europe',
  'Graciosa': 'Europe',
  'São Jorge': 'Europe',
  'Portimão': 'Europe',
  'Vila Real': 'Europe',
  'Chaves': 'Europe',
  'Bragança': 'Europe',
  'Coimbra': 'Europe',
  'Viseu': 'Europe',
  'Covilhã': 'Europe',
  'Aveiro': 'Europe',
  'Évora': 'Europe',
  'Sines': 'Europe',
  'Pombal': 'Europe',
  'Cascais': 'Europe',
  'Ponte de Lima': 'Europe',
  'Mirandela': 'Europe',
  'Mogadouro': 'Europe',
  'Caldas da Rainha': 'Europe',
  'Oeiras': 'Europe',
  'Montemor-o-Velho': 'Europe',
  'Amadora': 'Europe',
  'Luanda': 'Europe',

  // Europe - Netherlands
  'Amsterdam': 'Europe',

  // Europe - Switzerland
  'Zurich': 'Europe',
  'Geneva': 'Europe',
  'Basel': 'Europe',
  'Bern': 'Europe',
  'Lugano': 'Europe',

  // Europe - Austria
  'Vienna': 'Europe',

  // Europe - Belgium
  'Brussels': 'Europe',

  // Europe - Scandinavia
  'Copenhagen': 'Europe',
  'Oslo': 'Europe',
  'Stockholm': 'Europe',
  'Helsinki': 'Europe',
  'Reykjavík': 'Europe',
  'Bergen': 'Europe',
  'Trondheim': 'Europe',
  'Stavanger': 'Europe',
  'Gothenburg': 'Europe',
  'Malmö': 'Europe',
  'Billund': 'Europe',
  'Aarhus': 'Europe',

  // Europe - Ireland
  'Dublin': 'Europe',

  // Europe - Greece
  'Athens': 'Europe',

  // Europe - Turkey (European part)
  'Istanbul': 'Europe',

  // Europe - Eastern Europe
  'Warsaw': 'Europe',
  'Prague': 'Europe',
  'Budapest': 'Europe',
  'Bucharest': 'Europe',
  'Belgrade': 'Europe',
  'Zagreb': 'Europe',
  'Sofia': 'Europe',
  'Tallinn': 'Europe',
  'Riga': 'Europe',
  'Vilnius': 'Europe',

  // Africa
  'Marrakesh': 'Africa',
  'Casablanca': 'Africa',
  'Cairo': 'Africa',
  'Cape Town': 'Africa',
  'Johannesburg': 'Africa',
  'Nairobi': 'Africa',
  'Lagos': 'Africa',
  'Accra': 'Africa',
  'Addis Ababa': 'Africa',
  'Tunis': 'Africa',
  'Algiers': 'Africa',
}

async function populateRegions() {
  try {
    console.log('Starting region population...')
    
    // Get all airports
    const { data: airports, error } = await supabase
      .from('airports')
      .select('id, city_name')
      .order('city_name')
    
    if (error) {
      console.error('Error fetching airports:', error)
      return
    }
    
    console.log(`Found ${airports?.length || 0} airports`)
    
    // Group airports by region for batch updates
    const regionUpdates: Record<string, string[]> = {
      'North America': [],
      'Europe': [],
      'Africa': [],
      'Asia': [],
      'South America': [],
      'Oceania': []
    }
    
    // Process each airport
    airports?.forEach(airport => {
      const region = cityToRegion[airport.city_name]
      if (region) {
        regionUpdates[region].push(airport.id)
      } else {
        // Default to North America for unknown cities (mostly US cities)
        console.log(`Unknown city: ${airport.city_name} - defaulting to North America`)
        regionUpdates['North America'].push(airport.id)
      }
    })
    
    // Update airports by region in batches
    for (const [region, airportIds] of Object.entries(regionUpdates)) {
      if (airportIds.length > 0) {
        console.log(`Updating ${airportIds.length} airports to region: ${region}`)
        
        const { error: updateError } = await supabase
          .from('airports')
          .update({ region })
          .in('id', airportIds)
        
        if (updateError) {
          console.error(`Error updating region ${region}:`, updateError)
        } else {
          console.log(`Successfully updated ${region}`)
        }
      }
    }
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('airports')
      .select('region, count')
      .select('region')
      .not('region', 'is', null)
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError)
    } else {
      // Count regions manually
      const regionCounts: Record<string, number> = {}
      verifyData?.forEach(row => {
        regionCounts[row.region] = (regionCounts[row.region] || 0) + 1
      })
      
      console.log('\nRegion distribution:')
      Object.entries(regionCounts).forEach(([region, count]) => {
        console.log(`${region}: ${count} airports`)
      })
    }
    
    console.log('\nRegion population completed!')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
populateRegions()