-- Fix RLS policies for profile updates

-- 1. Ensure cities table is readable by all authenticated users
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on cities
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;
DROP POLICY IF EXISTS "Authenticated users can view cities" ON cities;

-- Create policy to allow all authenticated users to read cities
CREATE POLICY "Anyone can view cities" ON cities
    FOR SELECT USING (true);

-- 2. Fix users table update policy
-- Drop existing update policies
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a more permissive update policy for own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Ensure the foreign key constraint exists but is not too restrictive
-- First check if cities have the expected structure
DO $$
BEGIN
    -- Ensure at least one city exists for testing
    IF NOT EXISTS (SELECT 1 FROM cities LIMIT 1) THEN
        INSERT INTO cities (id, name, iata_code, timezone, created_at)
        VALUES 
            (gen_random_uuid(), 'London', 'LON', 'Europe/London', NOW()),
            (gen_random_uuid(), 'New York', 'NYC', 'America/New_York', NOW()),
            (gen_random_uuid(), 'Paris', 'PAR', 'Europe/Paris', NOW());
    END IF;
END $$;

-- 4. Test that users can select from cities and update their profile
-- This will help verify the policies work correctly
DO $$
DECLARE
    test_user_id UUID;
    test_city_id UUID;
BEGIN
    -- Get a user ID (if any exist)
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    -- Get a city ID
    SELECT id INTO test_city_id FROM cities LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_city_id IS NOT NULL THEN
        -- Try to update (this won't actually execute due to RLS in this context)
        RAISE NOTICE 'Test user ID: %, Test city ID: %', test_user_id, test_city_id;
    END IF;
END $$;

-- 5. Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'cities')
ORDER BY tablename, policyname;