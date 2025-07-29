import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearCityImages() {
  console.log('Starting city image cleanup...\n')

  try {
    // First, get all airports with city images
    console.log('Fetching airports with city images...')
    const { data: airports, error: fetchError } = await supabase
      .from('airports')
      .select('id, city_name, city_image_url')
      .not('city_image_url', 'is', null)

    if (fetchError) {
      throw new Error(`Failed to fetch airports: ${fetchError.message}`)
    }

    console.log(`Found ${airports?.length || 0} airports with city images\n`)

    // Clear city_image_url from all airports
    console.log('Clearing city_image_url from airports table...')
    const { error: updateError } = await supabase
      .from('airports')
      .update({ city_image_url: null })
      .not('city_image_url', 'is', null)

    if (updateError) {
      throw new Error(`Failed to update airports: ${updateError.message}`)
    }

    // List all files in the city-images bucket
    console.log('\nListing files in city-images bucket...')
    const { data: files, error: listError } = await supabase
      .storage
      .from('city-images')
      .list('cities', {
        limit: 1000,
        offset: 0
      })

    if (listError) {
      console.error('Error listing files:', listError)
    } else {
      console.log(`Found ${files?.length || 0} files in storage`)

      if (files && files.length > 0) {
        // Delete all files
        console.log('Deleting files from storage...')
        const filePaths = files.map(file => `cities/${file.name}`)
        
        const { error: deleteError } = await supabase
          .storage
          .from('city-images')
          .remove(filePaths)

        if (deleteError) {
          console.error('Error deleting files:', deleteError)
        } else {
          console.log(`Deleted ${filePaths.length} files from storage`)
        }
      }
    }

    console.log('\n✅ City images cleared successfully!')
    console.log('   - Cleared city_image_url from all airports')
    console.log('   - Deleted all images from storage bucket')
    console.log('\nYou can now run a new image fetch script with better image selection.')

  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
}

// Run the cleanup
clearCityImages()