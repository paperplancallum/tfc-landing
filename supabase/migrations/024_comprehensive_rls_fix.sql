-- Comprehensive fix for all RLS policies

-- First, disable RLS temporarily to fix issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Ensure your admin user exists
INSERT INTO users (id, email, is_admin, plan, created_at)
VALUES ('f4971052-2457-4e91-a717-4140709aceb9', 'callum@paperplan.co', true, 'free', NOW())
ON CONFLICT (id) DO UPDATE 
SET email = 'callum@paperplan.co', 
    is_admin = true;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can always view own record" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all users except self" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Service role bypass" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Create clean, non-conflicting policies

-- 1. Users can always see their own record
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own record
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 3. Allow new users to be created (important for signup)
CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Service role can do anything (for triggers and webhooks)
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- 5. Admin users can view all other users
CREATE POLICY "Admin users can view all" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 6. Admin users can update all users
CREATE POLICY "Admin users can update all" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Ensure the auth trigger function exists and works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (new.id, new.email, now())
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create policies for other tables that admins need to access
-- (Only if these tables exist)

-- Subscriptions table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
        DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
        
        CREATE POLICY "Users can view own subscriptions" ON subscriptions
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Admins can view all subscriptions" ON subscriptions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;

-- Emails sent table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'emails_sent') THEN
        DROP POLICY IF EXISTS "Users can view own emails" ON emails_sent;
        DROP POLICY IF EXISTS "Admins can view all emails sent" ON emails_sent;
        
        CREATE POLICY "Users can view own emails" ON emails_sent
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Admins can view all emails" ON emails_sent
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;