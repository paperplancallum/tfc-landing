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

// Unsplash Access Key - You'll need to get this from https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

// Image dimensions
const CARD_WIDTH = 800
const CARD_HEIGHT = 400
const HERO_WIDTH = 1920
const HERO_HEIGHT = 600

// Fallback images from Unsplash (no API key needed for these specific URLs)
const FALLBACK_IMAGES: Record<string, string> = {
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920',
  'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920',
  'Singapore': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920',
  'Los Angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1920',
  'San Francisco': 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=1920',
  'Miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1920',
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1920',
  'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920',
  'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920',
  'Hong Kong': 'https://images.unsplash.com/photo-1532455935509-eb76842cee50?w=1920',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920',
  'Munich': 'https://images.unsplash.com/photo-1577462281852-279bf3c8cf7e?w=1920',
  'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1920'
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url)
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

async function fetchCityImage(cityName: string): Promise<string | null> {
  // Check if we have a fallback image
  if (FALLBACK_IMAGES[cityName]) {
    return FALLBACK_IMAGES[cityName]
  }

  // If Unsplash API key is provided, try to fetch from API
  if (UNSPLASH_ACCESS_KEY) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName + ' city skyline')}&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.raw + '&w=1920'
        }
      }
    } catch (error) {
      console.error(`Failed to fetch from Unsplash API for ${cityName}:`, error)
    }
  }

  return null
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

    // Process each city
    for (const cityName of uniqueCities.slice(0, 20)) { // Limit to first 20 cities for testing
      console.log(`Processing ${cityName}...`)
      
      try {
        // Get image URL
        const imageUrl = await fetchCityImage(cityName)
        if (!imageUrl) {
          console.log(`  ⚠️  No image found for ${cityName}`)
          continue
        }

        // Create safe filename
        const safeFileName = cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        
        // Download original image
        const originalPath = path.join(tempDir, `${safeFileName}-original.jpg`)
        console.log(`  📥 Downloading image...`)
        await downloadImage(imageUrl, originalPath)

        // Process card size
        const cardPath = path.join(tempDir, `${safeFileName}-card.jpg`)
        console.log(`  🖼️  Creating card image (${CARD_WIDTH}x${CARD_HEIGHT})...`)
        await processImage(originalPath, cardPath, CARD_WIDTH, CARD_HEIGHT)

        // Process hero size
        const heroPath = path.join(tempDir, `${safeFileName}-hero.jpg`)
        console.log(`  🖼️  Creating hero image (${HERO_WIDTH}x${HERO_HEIGHT})...`)
        await processImage(originalPath, heroPath, HERO_WIDTH, HERO_HEIGHT)

        // Upload to Supabase
        console.log(`  ☁️  Uploading to Supabase...`)
        const cardUrl = await uploadToSupabase(cardPath, `${safeFileName}-card.jpg`)
        const heroUrl = await uploadToSupabase(heroPath, `${safeFileName}-hero.jpg`)

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
        }

        // Clean up temp files
        await fs.unlink(originalPath)
        await fs.unlink(cardPath)
        await fs.unlink(heroPath)

      } catch (error) {
        console.error(`  ❌ Error processing ${cityName}:`, error)
      }
    }

    console.log('\n✨ City image processing complete!')

  } finally {
    // Clean up temp directory
    try {
      await fs.rmdir(tempDir)
    } catch (error) {
      // Directory might not be empty if some files failed
    }
  }
}

// Run the script
main().catch(console.error)