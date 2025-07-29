#!/bin/bash

# Script to run the airport import from CSV to Supabase

echo "Airport Import Script"
echo "===================="
echo ""

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: Missing required environment variables"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY"
    exit 1
fi

# Navigate to the project directory
cd "$(dirname "$0")/.." || exit 1

# Check if airports.csv exists
if [ ! -f "airports.csv" ]; then
    echo "Error: airports.csv file not found in project root"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the TypeScript import script
echo "Running airport import..."
npx tsx scripts/import-airports-csv.ts

echo ""
echo "Import process completed!"