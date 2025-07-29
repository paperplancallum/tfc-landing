import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs/promises'
import * as path from 'path'
import sharp from 'sharp'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Image dimensions
const HERO_WIDTH = 1920
const HERO_HEIGHT = 600

// Get batch size from command line or default to 10
const BATCH_SIZE = parseInt(process.argv[2] || '10')

interface UnsplashPhoto {
  id: string
  urls: {
    raw: string
    regular: string
  }
  description: string | null
  alt_description: string | null
  tags: Array<{ title: string }>
  user: {
    name: string
  }
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[]
  total: number
}

async function searchCityImage(cityName: string): Promise<string | null> {
  if (!unsplashAccessKey) {
    console.log(`  ⚠️  No Unsplash API key provided, using fallback`)
    return getFallbackImage(cityName)
  }

  // Try different search terms
  const searchTerms = [
    `${cityName} cityscape`,
    `${cityName} skyline`,
    `${cityName} aerial view`,
    `${cityName} downtown`,
    `${cityName} city center`,
    `${cityName} landmark`
  ]

  for (const searchTerm of searchTerms) {
    try {
      console.log(`  🔍 Searching for: "${searchTerm}"`)
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${unsplashAccessKey}`
          }
        }
      )

      if (!response.ok) {
        console.log(`  ❌ API error: ${response.status} ${response.statusText}`)
        continue
      }

      const data: UnsplashSearchResponse = await response.json()
      
      if (data.results && data.results.length > 0) {
        // Find the best image based on tags and description
        const bestImage = data.results.find(photo => {
          const tags = photo.tags ? photo.tags.map(t => t.title.toLowerCase()) : []
          const description = (photo.description || photo.alt_description || '').toLowerCase()
          
          // Check if it's actually a city photo
          const cityKeywords = ['city', 'skyline', 'downtown', 'urban', 'building', 'architecture', 'cityscape', 'aerial', 'view']
          const hasGoodTags = tags.some(tag => cityKeywords.some(keyword => tag.includes(keyword)))
          const hasGoodDescription = cityKeywords.some(keyword => description.includes(keyword))
          
          // Avoid photos that are clearly not cityscapes
          const badKeywords = ['person', 'people', 'portrait', 'flower', 'plant', 'food', 'animal', 'indoor', 'interior']
          const hasBadTags = tags.some(tag => badKeywords.some(keyword => tag.includes(keyword)))
          const hasBadDescription = badKeywords.some(keyword => description.includes(keyword))
          
          return (hasGoodTags || hasGoodDescription) && !hasBadTags && !hasBadDescription
        }) || data.results[0] // Fall back to first result if no perfect match

        console.log(`  ✅ Found image by ${bestImage.user.name}`)
        return bestImage.urls.raw
      }
    } catch (error) {
      console.log(`  ❌ Search error:`, error)
    }
  }

  // If all searches fail, use fallback
  return getFallbackImage(cityName)
}

function getFallbackImage(cityName: string): string {
  // Known good city images as fallback
  const fallbacks: Record<string, string> = {
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    'Paris': 'https://images.unsplash.com/photo-1431274172761-fca41d930114',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    'Tokyo': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    'Amsterdam': 'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    // Generic city skyline as ultimate fallback
    'DEFAULT': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000'
  }
  
  return fallbacks[cityName] || fallbacks['DEFAULT']
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
  console.log(`Starting city image search and processing (${BATCH_SIZE} cities per batch)...\n`)

  if (!unsplashAccessKey) {
    console.log('⚠️  WARNING: No UNSPLASH_ACCESS_KEY found in environment variables')
    console.log('   Images will use fallback URLs which may not be city-specific\n')
    console.log('   To use Unsplash search API:')
    console.log('   1. Get a free API key from https://unsplash.com/developers')
    console.log('   2. Add to .env.local: UNSPLASH_ACCESS_KEY=your_key_here\n')
  }

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
      console.log(`\n🏙️  Processing ${cityName}...`)
      
      try {
        // Search for appropriate image
        const imageUrl = await searchCityImage(cityName)
        if (!imageUrl) {
          console.log(`  ⚠️  No suitable image found for ${cityName}`)
          skipped++
          continue
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

        // Rate limiting - wait 1 second between API calls
        if (unsplashAccessKey) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

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
      await fs.rmdir(tempDir, { recursive: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Run the script
main().catch(console.error)