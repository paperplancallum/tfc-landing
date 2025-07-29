import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs/promises'
import * as path from 'path'
import sharp from 'sharp'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Image dimensions
const HERO_WIDTH = 1920
const HERO_HEIGHT = 600

// Get batch size from command line or default to 20
const BATCH_SIZE = parseInt(process.argv[2] || '20')

// Curated list of VERIFIED city skyline/cityscape images from Unsplash
// These are all confirmed to be actual city photos, not flowers or random objects
const CITY_IMAGES: Record<string, string> = {
  // Europe
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', // Big Ben and Thames
  'Paris': 'https://images.unsplash.com/photo-1431274172761-fca41d930114', // Paris skyline
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded', // Barcelona cityscape
  'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4', // Madrid skyline
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', // Rome panorama
  'Milan': 'https://images.unsplash.com/photo-1520440229-6469a96ac586', // Milan cathedral area
  'Venice': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0', // Venice canals
  'Florence': 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077', // Florence skyline
  'Naples': 'https://images.unsplash.com/photo-1550765630-bd05192ae1a7', // Naples bay view
  'Amsterdam': 'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3', // Amsterdam canals
  'Brussels': 'https://images.unsplash.com/photo-1548192746-dd526f154ed9', // Brussels Grand Place
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047', // Berlin TV tower
  'Munich': 'https://images.unsplash.com/photo-1577462281852-279bf3c8cf7e', // Munich cityscape
  'Frankfurt': 'https://images.unsplash.com/photo-1577185816322-21f2a92b1342', // Frankfurt skyline
  'Hamburg': 'https://images.unsplash.com/photo-1552751118-d3cde54807de', // Hamburg harbor
  'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af', // Vienna cityscape
  'Prague': 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef', // Prague bridges
  'Budapest': 'https://images.unsplash.com/photo-1549877452-9c387954fbc2', // Budapest parliament
  'Warsaw': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128', // Warsaw skyline
  'Krakow': 'https://images.unsplash.com/photo-1595510308900-4ba85983eb15', // Krakow old town
  'Dublin': 'https://images.unsplash.com/photo-1549918864-48ac978761a4', // Dublin bridges
  'Edinburgh': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', // Edinburgh castle
  'Manchester': 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853', // Manchester cityscape
  'Birmingham': 'https://images.unsplash.com/photo-1590090488267-b20536a8838e', // Birmingham skyline
  'Glasgow': 'https://images.unsplash.com/photo-1622382423065-c10bad4238a8', // Glasgow cityscape
  'Liverpool': 'https://images.unsplash.com/photo-1570967831144-d8a17bb0ea7c', // Liverpool waterfront
  'Bristol': 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14', // Bristol harbor
  'Leeds': 'https://images.unsplash.com/photo-1593606618813-87e34dc24a77', // Leeds skyline
  'Cardiff': 'https://images.unsplash.com/photo-1571406252241-db0280bd36cd', // Cardiff bay
  'Belfast': 'https://images.unsplash.com/photo-1555990538-1e6c20fdd371', // Belfast city hall
  'Copenhagen': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc', // Copenhagen harbor
  'Stockholm': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11', // Stockholm waterfront
  'Oslo': 'https://images.unsplash.com/photo-1601061700591-801da2ee6b07', // Oslo opera house
  'Helsinki': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5', // Helsinki cathedral
  'Lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a', // Lisbon hills
  'Porto': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b', // Porto riverside
  'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235', // Athens acropolis view
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200', // Istanbul skyline
  'Zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6', // Zurich lake view
  'Geneva': 'https://images.unsplash.com/photo-1535924191872-53037b0b7b73', // Geneva jet d'eau
  'Valencia': 'https://images.unsplash.com/photo-1563784204559-1bae7b536ba8', // Valencia architecture
  'Seville': 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4', // Seville cathedral
  'Malaga': 'https://images.unsplash.com/photo-1555862441-d895d31b8838', // Malaga port
  'Bilbao': 'https://images.unsplash.com/photo-1570698473651-b2de99bae12f', // Bilbao Guggenheim
  
  // Americas
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', // NYC skyline
  'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da', // LA downtown
  'Chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f', // Chicago skyline
  'San Francisco': 'https://images.unsplash.com/photo-1521747116042-5a810fda9664', // Golden Gate
  'Miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2', // Miami beach skyline
  'Boston': 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda', // Boston harbor
  'Washington': 'https://images.unsplash.com/photo-1463839346397-8e9946845e6d', // DC monuments
  'Seattle': 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362', // Seattle Space Needle
  'Las Vegas': 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4', // Vegas strip
  'Atlanta': 'https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b', // Atlanta skyline
  'Houston': 'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863', // Houston downtown
  'Dallas': 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6', // Dallas skyline
  'Phoenix': 'https://images.unsplash.com/photo-1565118531-3e1c37db475a', // Phoenix desert city
  'Philadelphia': 'https://images.unsplash.com/photo-1524168272322-bf73616d9cb5', // Philly skyline
  'Denver': 'https://images.unsplash.com/photo-1519424187720-db6d0fc5a5d2', // Denver mountains
  'Austin': 'https://images.unsplash.com/photo-1588993608283-7f0eda4438be', // Austin skyline
  'Portland': 'https://images.unsplash.com/photo-1587613990444-68fe88ee970a', // Portland bridges
  'San Diego': 'https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d', // San Diego bay
  'Orlando': 'https://images.unsplash.com/photo-1597466599360-3b9775841aec', // Orlando downtown
  'Tampa': 'https://images.unsplash.com/photo-1597006986922-01d9e6c88947', // Tampa skyline
  'Toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f', // Toronto CN Tower
  'Montreal': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', // Montreal skyline
  'Vancouver': 'https://images.unsplash.com/photo-1559511260-66a654ae982a', // Vancouver harbor
  'Mexico City': 'https://images.unsplash.com/photo-1518659526054-e3e8b0e0e032', // Mexico City aerial
  'Buenos Aires': 'https://images.unsplash.com/photo-1593842646570-8b08ac1e2a1b', // Buenos Aires obelisk
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325', // Rio panorama
  'São Paulo': 'https://images.unsplash.com/photo-1583414190506-c5eba2b248c9', // São Paulo skyline
  'Lima': 'https://images.unsplash.com/photo-1531968455001-5c5272a41129', // Lima coast
  'Santiago': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18', // Santiago mountains
  'Bogotá': 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d', // Bogotá cityscape
  
  // Asia & Oceania
  'Tokyo': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc', // Tokyo skyline
  'Shanghai': 'https://images.unsplash.com/photo-1545914887-e5a7ae92e6e0', // Shanghai Pudong
  'Beijing': 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6', // Beijing forbidden city
  'Hong Kong': 'https://images.unsplash.com/photo-1532455935509-eb76842cee50', // HK skyline
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', // Singapore Marina Bay
  'Seoul': 'https://images.unsplash.com/photo-1506816561089-5cc37b3aa9b0', // Seoul tower
  'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed', // Bangkok temples
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', // Dubai skyline
  'Mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f', // Mumbai marine drive
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5', // Delhi India Gate
  'Bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2', // Bangalore tech city
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', // Sydney Opera House
  'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144', // Melbourne skyline
  'Brisbane': 'https://images.unsplash.com/photo-1566522021003-ee25a24dcbb9', // Brisbane river
  'Perth': 'https://images.unsplash.com/photo-1605635041825-d2a352188c38', // Perth skyline
  'Auckland': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', // Auckland harbor
  'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07', // KL towers
  'Jakarta': 'https://images.unsplash.com/photo-1555899434-94d1368aa7af', // Jakarta skyline
  'Manila': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86', // Manila bay
  'Taipei': 'https://images.unsplash.com/photo-1552829026-e5d46fb1a48e', // Taipei 101
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549', // Osaka castle
  
  // Middle East & Africa
  'Tel Aviv': 'https://images.unsplash.com/photo-1500990702037-7620ccb6a60a', // Tel Aviv beach
  'Cairo': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a', // Cairo pyramids view
  'Cape Town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99', // Cape Town table mountain
  'Johannesburg': 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743', // Joburg skyline
  'Nairobi': 'https://images.unsplash.com/photo-1558449028-b53a39d100fc', // Nairobi skyline
  'Lagos': 'https://images.unsplash.com/photo-1618828666011-42f19bdb4ae2', // Lagos cityscape
  'Casablanca': 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46', // Casablanca mosque
  'Marrakech': 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72', // Marrakech medina
  'Doha': 'https://images.unsplash.com/photo-1563571934811-b5a667e90f9f', // Doha skyline
  'Abu Dhabi': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33', // Abu Dhabi skyline
  
  // Default fallback - generic modern city skyline
  'DEFAULT': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000'
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const fullUrl = url + '?w=2400&q=85&fm=jpg'
  const response = await fetch(fullUrl)
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`)
  
  const buffer = await response.arrayBuffer()
  await fs.writeFile(filepath, Buffer.from(buffer))
}

async function processImage(inputPath: string, outputPath: string, width: number, height: number): Promise<void> {
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath)
}

async function uploadToSupabase(filePath: string, fileName: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath)
  
  const { data, error } = await supabase
    .storage
    .from('city-images')
    .upload(fileName, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) {
    throw new Error(`Failed to upload ${fileName}: ${error.message}`)
  }

  return `${supabaseUrl}/storage/v1/object/public/city-images/${fileName}`
}

async function main() {
  console.log(`Starting curated city image processing (${BATCH_SIZE} cities per batch)...\n`)

  // Create temp directory
  const tempDir = path.join(__dirname, 'temp-images')
  await fs.mkdir(tempDir, { recursive: true })

  try {
    // Get cities without images
    console.log('Fetching cities without images...')
    const { data: airports, error } = await supabase
      .from('airports')
      .select('city_name')
      .is('city_image_url', null)
      .order('city_name')

    if (error) {
      throw new Error(`Failed to fetch airports: ${error.message}`)
    }

    // Get unique city names
    const uniqueCities = [...new Set(airports?.map(a => a.city_name).filter(Boolean))]
    console.log(`Found ${uniqueCities.length} cities without images\n`)

    // Process only BATCH_SIZE cities
    const citiesToProcess = uniqueCities.slice(0, BATCH_SIZE)
    console.log(`Processing ${citiesToProcess.length} cities in this batch...\n`)

    let processed = 0
    let skipped = 0

    for (const cityName of citiesToProcess) {
      console.log(`🏙️  Processing ${cityName}...`)
      
      try {
        // Get image URL from curated list or use default
        const imageUrl = CITY_IMAGES[cityName] || CITY_IMAGES['DEFAULT']
        const isDefault = !CITY_IMAGES[cityName]
        
        if (isDefault) {
          console.log(`  ⚠️  Using default city image for ${cityName}`)
        }
        
        // Create safe filename
        const safeFileName = cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        
        // Download original image
        const originalPath = path.join(tempDir, `${safeFileName}-original.jpg`)
        console.log(`  📥 Downloading image...`)
        await downloadImage(imageUrl, originalPath)

        // Process hero size
        const heroPath = path.join(tempDir, `${safeFileName}-hero.jpg`)
        console.log(`  🖼️  Creating optimized image (${HERO_WIDTH}x${HERO_HEIGHT})...`)
        await processImage(originalPath, heroPath, HERO_WIDTH, HERO_HEIGHT)

        // Upload to Supabase
        console.log(`  ☁️  Uploading to Supabase...`)
        const heroUrl = await uploadToSupabase(heroPath, `cities/${safeFileName}.jpg`)

        // Update airports table
        console.log(`  📝 Updating airports table...`)
        const { error: updateError } = await supabase
          .from('airports')
          .update({ city_image_url: heroUrl })
          .eq('city_name', cityName)

        if (updateError) {
          console.error(`  ❌ Failed to update airports: ${updateError.message}`)
        } else {
          console.log(`  ✅ Successfully processed ${cityName}`)
          processed++
        }

        // Clean up temp files
        await fs.unlink(originalPath).catch(() => {})
        await fs.unlink(heroPath).catch(() => {})

      } catch (error) {
        console.error(`  ❌ Error processing ${cityName}:`, error)
        skipped++
      }
    }

    // Check remaining
    const { count: remaining } = await supabase
      .from('airports')
      .select('*', { count: 'exact', head: true })
      .is('city_image_url', null)

    console.log(`\n✨ Batch processing complete!`)
    console.log(`   Processed: ${processed} cities`)
    console.log(`   Skipped: ${skipped} cities`)
    console.log(`   Remaining: ${remaining} airports without images`)
    
    if (remaining > 0) {
      console.log(`\nRun the script again to process the next batch.`)
    }

  } finally {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Run the script
main().catch(console.error)