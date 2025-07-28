-- Add RLS policy to allow service role to insert deals
-- This allows our webhook (which uses the service role) to insert deals

-- First, let's check if we need to create a policy for inserting deals
-- The service role bypasses RLS, but we're using the anon key in our webhook
-- So we need to create a policy that allows inserts

-- Create a policy that allows anyone to insert deals
-- In production, you might want to restrict this further
CREATE POLICY "Allow webhook to insert deals" ON deals
    FOR INSERT 
    WITH CHECK (true);

-- Note: In a production environment, you might want to:
-- 1. Use a service role key in your webhook (bypasses RLS entirely)
-- 2. Or create a more restrictive policy that checks for a specific header or token
-- 3. Or create a separate webhook_users table and check authentication