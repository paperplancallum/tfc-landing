#!/bin/bash

# Script to run the airport import from CSV to Supabase

echo "Airport Import Script"
echo "===================="
echo ""

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "Error: Missing NEXT_PUBLIC_SUPABASE_URL"
    echo "Please set this in your .env.local file"
    exit 1
fi

# Use service key if available, otherwise use anon key
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "Error: Missing both SUPABASE_SERVICE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "Please set at least one of these in your .env.local file"
        exit 1
    fi
    echo "Warning: Using anon key instead of service key. Some operations may be restricted."
    export SUPABASE_SERVICE_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
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