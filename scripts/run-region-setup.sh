#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up regions for airports...${NC}"

echo -e "${YELLOW}Note: Please ensure the migration 017_add_region_to_airports.sql has been run in your Supabase dashboard${NC}"
echo -e "${YELLOW}The migration adds a 'region' column to the airports table${NC}"

# Run the TypeScript script to populate regions
echo -e "${GREEN}Populating regions based on city names...${NC}"
npx tsx scripts/populate-airport-regions.ts

# Check if script was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Region population completed successfully!${NC}"
else
    echo -e "${RED}Region population failed. Please check the error above.${NC}"
    exit 1
fi

echo -e "${GREEN}All done! Airports now have regions assigned.${NC}"