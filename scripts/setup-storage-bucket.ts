import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBucket() {
  console.log('Setting up Supabase Storage bucket for city images...\n')

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
      throw listError
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'city-images')

    if (bucketExists) {
      console.log('✅ Bucket "city-images" already exists')
    } else {
      // Create the bucket
      const { data, error: createError } = await supabase
        .storage
        .createBucket('city-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })

      if (createError) {
        console.error('Error creating bucket:', createError)
        throw createError
      }

      console.log('✅ Created bucket "city-images"')
    }

    // Get the public URL pattern
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/city-images/`
    console.log(`\n📸 Images will be accessible at: ${publicUrl}[filename]`)
    
    console.log('\n✨ Storage bucket setup complete!')
    
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupStorageBucket()