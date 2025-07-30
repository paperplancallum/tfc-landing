-- FINAL FIX for infinite recursion in RLS policies
-- This completely rebuilds all policies to avoid any recursion

-- 1. Disable RLS temporarily to clean everything up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on users table
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- 3. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;

-- 4. Create NEW, SIMPLE policies that CANNOT cause recursion

-- Users table policies
CREATE POLICY "user_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "user_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policy using JWT email (no table lookup!)
CREATE POLICY "admin_all" ON users
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'callum@paperplan.co'
    );

-- Service role policy
CREATE POLICY "service_role" ON users
    FOR ALL USING (
        current_setting('request.jwt.claim.role', true) = 'service_role'
    );

-- 5. Cities table - completely open for reading
DROP POLICY IF EXISTS "Anyone can view cities" ON cities;
CREATE POLICY "public_read" ON cities
    FOR SELECT USING (true);

-- 6. Subscriptions table
DO $$ 
BEGIN
    -- Drop existing policies
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON subscriptions', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "sub_user_select" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sub_admin_all" ON subscriptions
    FOR ALL USING (auth.jwt() ->> 'email' = 'callum@paperplan.co');

-- 7. Emails sent table
DO $$ 
BEGIN
    -- Drop existing policies
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'emails_sent' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON emails_sent', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "email_user_select" ON emails_sent
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "email_admin_all" ON emails_sent
    FOR ALL USING (auth.jwt() ->> 'email' = 'callum@paperplan.co');

-- 8. Create or replace the auth trigger to ensure it works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (new.id, new.email, now())
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Verify the policies
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'cities', 'subscriptions', 'emails_sent')
ORDER BY tablename, policyname;

-- 10. Test that basic operations work
-- This should return the admin user if you're logged in as callum@paperplan.co
SELECT id, email, is_admin FROM users WHERE email = 'callum@paperplan.co';