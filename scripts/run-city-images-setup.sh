#!/bin/bash

# Script to set up city images for airports

echo "City Images Setup Script"
echo "========================"
echo ""

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: Missing required environment variables"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local"
    exit 1
fi

echo "Step 1: Running database migration"
echo "----------------------------------"
echo "Please run this SQL in your Supabase dashboard:"
echo "https://supabase.com/dashboard/project/tihoougxhpakomvxxlgl/sql/new"
echo ""
cat supabase/migrations/016_add_city_image_to_airports.sql
echo ""
echo "Press Enter when you've run the migration..."
read

echo ""
echo "Step 2: Setting up storage bucket"
echo "---------------------------------"
npx tsx scripts/setup-storage-bucket.ts

echo ""
echo "Step 3: Installing dependencies"
echo "-------------------------------"
npm install

echo ""
echo "Step 4: Fetching and processing city images"
echo "-------------------------------------------"
echo "This will download images for all unique cities and upload them to Supabase."
echo "Press Enter to continue..."
read

npx tsx scripts/fetch-city-images-simple.ts

echo ""
echo "✨ Setup complete!"
echo ""
echo "The city images have been:"
echo "- Downloaded from Unsplash"
echo "- Optimized for web display"
echo "- Uploaded to Supabase Storage"
echo "- Linked to airports in the database"
echo ""
echo "You can now use the city_image_url field from the airports table in your components."