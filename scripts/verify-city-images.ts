import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyImages() {
  console.log('Verifying city images in database...\n')

  try {
    // Get all unique cities with images
    const { data: airports, error } = await supabase
      .from('airports')
      .select('city_name, city_image_url')
      .not('city_image_url', 'is', null)
      .order('city_name')

    if (error) {
      throw new Error(`Failed to fetch airports: ${error.message}`)
    }

    // Group by city to get unique cities
    const cityImages = new Map<string, string>()
    airports?.forEach(airport => {
      if (airport.city_name && airport.city_image_url) {
        cityImages.set(airport.city_name, airport.city_image_url)
      }
    })

    console.log(`Found ${cityImages.size} cities with images:\n`)

    // Display first 20 cities with their image URLs
    let count = 0
    for (const [city, url] of cityImages) {
      console.log(`${city}:`)
      console.log(`  ${url}`)
      count++
      if (count >= 20) {
        console.log(`\n... and ${cityImages.size - 20} more cities`)
        break
      }
    }

    // Check for remaining cities without images
    const { count: withoutImages } = await supabase
      .from('airports')
      .select('*', { count: 'exact', head: true })
      .is('city_image_url', null)

    console.log(`\n📊 Summary:`)
    console.log(`   Cities with images: ${cityImages.size}`)
    console.log(`   Airports without images: ${withoutImages}`)

  } catch (error) {
    console.error('Verification failed:', error)
  }
}

// Run verification
verifyImages()