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
const CARD_WIDTH = 800
const CARD_HEIGHT = 400
const HERO_WIDTH = 1920
const HERO_HEIGHT = 600

// Curated list of city images from Unsplash (direct URLs, no API needed)
const CITY_IMAGES: Record<string, string> = {
  // Major cities
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
  'Singapore': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da',
  'San Francisco': 'https://images.unsplash.com/photo-1521747116042-5a810fda9664',
  'Miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2',
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047',
  'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
  'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
  'Hong Kong': 'https://images.unsplash.com/photo-1532455935509-eb76842cee50',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  'Munich': 'https://images.unsplash.com/photo-1577462281852-279bf3c8cf7e',
  'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af',
  'Prague': 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef',
  'Copenhagen': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc',
  'Stockholm': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11',
  'Oslo': 'https://images.unsplash.com/photo-1601061700591-801da2ee6b07',
  'Helsinki': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5',
  'Lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a',
  'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235',
  'Dublin': 'https://images.unsplash.com/photo-1549918864-48ac978761a4',
  'Brussels': 'https://images.unsplash.com/photo-1548192746-dd526f154ed9',
  'Zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6',
  'Geneva': 'https://images.unsplash.com/photo-1535924191872-53037b0b7b73',
  'Milan': 'https://images.unsplash.com/photo-1520440229-6469a96ac586',
  'Venice': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
  'Florence': 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077',
  'Naples': 'https://images.unsplash.com/photo-1550765630-bd05192ae1a7',
  'Valencia': 'https://images.unsplash.com/photo-1563784204559-1bae7b536ba8',
  'Seville': 'https://images.unsplash.com/photo-1560969184-10fe8719e047',
  'Malaga': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  'Bilbao': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
  // UK Cities
  'Manchester': 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853',
  'Edinburgh': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
  'Birmingham': 'https://images.unsplash.com/photo-1590090488267-b20536a8838e',
  'Glasgow': 'https://images.unsplash.com/photo-1622382423065-c10bad4238a8',
  'Bristol': 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14',
  'Liverpool': 'https://images.unsplash.com/photo-1570967831144-d8a17bb0ea7c',
  'Newcastle': 'https://images.unsplash.com/photo-1590766940554-634cf4226b19',
  'Leeds': 'https://images.unsplash.com/photo-1593606618813-87e34dc24a77',
  'Cardiff': 'https://images.unsplash.com/photo-1571406252241-db0280bd36cd',
  'Belfast': 'https://images.unsplash.com/photo-1595676424169-1b1b3b6dafb0',
  // US Cities
  'Chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f',
  'Boston': 'https://images.unsplash.com/photo-1491168034976-6d6b5e268b71',
  'Washington': 'https://images.unsplash.com/photo-1463839346397-8e9946845e6d',
  'Seattle': 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362',
  'Las Vegas': 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4',
  'Atlanta': 'https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b',
  'Houston': 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c',
  'Dallas': 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6',
  'Phoenix': 'https://images.unsplash.com/photo-1565118531-3e1c37db475a',
  'Philadelphia': 'https://images.unsplash.com/photo-1579800222368-b1c66eb5b772',
  'Denver': 'https://images.unsplash.com/photo-1519424187720-db6d0fc5a5d2',
  'Austin': 'https://images.unsplash.com/photo-1588993608283-7f0eda4438be',
  'Portland': 'https://images.unsplash.com/photo-1587613990444-68fe88ee970a',
  'San Diego': 'https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d',
  'Orlando': 'https://images.unsplash.com/photo-1597466599360-3b9775841aec',
  'Minneapolis': 'https://images.unsplash.com/photo-1569431043425-e9cec3bee5d1',
  'Detroit': 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb',
  'Tampa': 'https://images.unsplash.com/photo-1597006986922-01d9e6c88947',
  // Asian Cities
  'Shanghai': 'https://images.unsplash.com/photo-1545914887-e5a7ae92e6e0',
  'Beijing': 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6',
  'Seoul': 'https://images.unsplash.com/photo-1506816561089-5cc37b3aa9b0',
  'Mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
  'Bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2',
  'Osaka': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
  'Taipei': 'https://images.unsplash.com/photo-1552829026-e5d46fb1a48e',
  'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07',
  'Jakarta': 'https://images.unsplash.com/photo-1555899434-94d1368aa7af',
  'Manila': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86',
  'Ho Chi Minh City': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  // Australian Cities
  'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144',
  'Brisbane': 'https://images.unsplash.com/photo-1566522021003-ee25a24dcbb9',
  'Perth': 'https://images.unsplash.com/photo-1605635041825-d2a352188c38',
  'Adelaide': 'https://images.unsplash.com/photo-1600194992440-50b959a7e7c3',
  // Canadian Cities
  'Toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f',
  'Montreal': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
  'Vancouver': 'https://images.unsplash.com/photo-1559511260-66a654ae982a',
  // Middle Eastern Cities
  'Tel Aviv': 'https://images.unsplash.com/photo-1500990702037-7620ccb6a60a',
  'Cairo': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a',
  'Doha': 'https://images.unsplash.com/photo-1563571934811-b5a667e90f9f',
  'Kuwait City': 'https://images.unsplash.com/photo-1580157508103-2f70f5062bf8',
  'Riyadh': 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6',
  // African Cities
  'Cape Town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99',
  'Johannesburg': 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743',
  'Nairobi': 'https://images.unsplash.com/photo-1558449028-b53a39d100fc',
  'Lagos': 'https://images.unsplash.com/photo-1618828666011-42f19bdb4ae2',
  // South American Cities
  'Buenos Aires': 'https://images.unsplash.com/photo-1593842646570-8b08ac1e2a1b',
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
  'São Paulo': 'https://images.unsplash.com/photo-1583414190506-c5eba2b248c9',
  'Lima': 'https://images.unsplash.com/photo-1531968455001-5c5272a41129',
  'Santiago': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18',
  'Bogotá': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
  'Mexico City': 'https://images.unsplash.com/photo-1518659526054-e3e8b0e0e032',
  // Other European Cities
  'Warsaw': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128',
  'Budapest': 'https://images.unsplash.com/photo-1549877452-9c387954fbc2',
  'Bucharest': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1',
  'Sofia': 'https://images.unsplash.com/photo-1601297888606-a22e59ece7e9',
  'Belgrade': 'https://images.unsplash.com/photo-1595436142161-130d276f0d3a',
  'Zagreb': 'https://images.unsplash.com/photo-1606994111342-800eed7cf268',
  'Ljubljana': 'https://images.unsplash.com/photo-1558271736-cd043ef2e855',
  'Tallinn': 'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b7',
  'Riga': 'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5',
  'Vilnius': 'https://images.unsplash.com/photo-1548115184-bc6544d06a58',
  'Reykjavík': 'https://images.unsplash.com/photo-1594654065700-5f8c4ae1e5b5',
  'Luxembourg': 'https://images.unsplash.com/photo-1609077479122-79e1e9e9fb08',
  'Monaco': 'https://images.unsplash.com/photo-1596466889998-49c973a8c0e0',
  // Generic fallback for cities not in list
  'DEFAULT': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df'
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  // Add parameters for high quality
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

  // Return the public URL
  return `${supabaseUrl}/storage/v1/object/public/city-images/${fileName}`
}

async function main() {
  console.log('Starting city image fetch and processing...\n')

  // Create temp directory
  const tempDir = path.join(__dirname, 'temp-images')
  await fs.mkdir(tempDir, { recursive: true })

  try {
    // Get unique cities from airports table
    console.log('Fetching unique cities from airports...')
    const { data: airports, error } = await supabase
      .from('airports')
      .select('city_name')
      .order('city_name')

    if (error) {
      throw new Error(`Failed to fetch airports: ${error.message}`)
    }

    // Get unique city names
    const uniqueCities = [...new Set(airports?.map(a => a.city_name).filter(Boolean))]
    console.log(`Found ${uniqueCities.length} unique cities\n`)

    let processed = 0
    let skipped = 0

    // Process each city
    for (const cityName of uniqueCities) {
      console.log(`\nProcessing ${cityName}...`)
      
      try {
        // Get image URL (use default if city not found)
        const imageUrl = CITY_IMAGES[cityName] || CITY_IMAGES['DEFAULT']
        
        // Create safe filename
        const safeFileName = cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        
        // Download original image
        const originalPath = path.join(tempDir, `${safeFileName}-original.jpg`)
        console.log(`  📥 Downloading image...`)
        await downloadImage(imageUrl, originalPath)

        // Process hero size (we'll use this for both cards and hero)
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
        await fs.unlink(originalPath)
        await fs.unlink(heroPath)

      } catch (error) {
        console.error(`  ❌ Error processing ${cityName}:`, error)
        skipped++
      }
    }

    console.log(`\n✨ City image processing complete!`)
    console.log(`   Processed: ${processed} cities`)
    console.log(`   Skipped: ${skipped} cities`)

  } finally {
    // Clean up temp directory
    try {
      await fs.rmdir(tempDir, { recursive: true })
    } catch (error) {
      console.error('Failed to clean up temp directory:', error)
    }
  }
}

// Run the script
main().catch(console.error)