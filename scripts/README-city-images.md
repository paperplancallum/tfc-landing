# City Images Upload Script

This script uploads city images from the CSV file to Supabase storage and updates the airports table.

## Prerequisites

1. Run the migration to add the city_image_url column:
   ```sql
   ALTER TABLE airports ADD COLUMN IF NOT EXISTS city_image_url TEXT;
   ```
   
   You can run this migration through:
   - Supabase Dashboard SQL Editor
   - Or using: `npx supabase db push` (requires database password)

2. Ensure environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Running the Script

```bash
npx tsx scripts/upload-city-images.ts
```

The script will:
1. Read the images.csv file
2. Download each image from the provided URLs
3. Upload images to Supabase storage bucket 'city-images'
4. Update the airports table with the new Supabase image URLs

## What it does

- Creates a public storage bucket called 'city-images' if it doesn't exist
- Downloads images from Skyscanner URLs
- Uploads them as {iata_code}.jpg to Supabase
- Updates the city_image_url field in the airports table matching by IATA code