-- Final fix for admin access - using email-based policies

-- 1. Drop all existing policies on users table
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
    END LOOP;
END $$;

-- 2. Create new, simple policies that work
-- Allow users to see their own record
CREATE POLICY "users_own_select" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own record
CREATE POLICY "users_own_update" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own record (for signup)
CREATE POLICY "users_own_insert" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Special admin policy using JWT email claim
CREATE POLICY "admin_all_access" ON users
    FOR ALL USING (
        (auth.jwt() ->> 'email') = 'callum@paperplan.co'
    );

-- 3. Fix subscriptions table policies
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
    
    -- Create new policies
    CREATE POLICY "subscriptions_own_select" ON subscriptions
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "subscriptions_admin_all" ON subscriptions
        FOR ALL USING ((auth.jwt() ->> 'email') = 'callum@paperplan.co');
END $$;

-- 4. Fix emails_sent table policies
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
    
    -- Create new policies
    CREATE POLICY "emails_own_select" ON emails_sent
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "emails_admin_all" ON emails_sent
        FOR ALL USING ((auth.jwt() ->> 'email') = 'callum@paperplan.co');
END $$;

-- 5. Ensure admin user exists
INSERT INTO users (id, email, is_admin, plan, created_at)
SELECT 
    id,
    'callum@paperplan.co',
    true,
    'free',
    NOW()
FROM auth.users
WHERE email = 'callum@paperplan.co'
ON CONFLICT (id) DO UPDATE
SET is_admin = true,
    email = 'callum@paperplan.co';

-- 6. Verify everything works
SELECT 'Admin user check:' as check_type, * FROM users WHERE email = 'callum@paperplan.co';
SELECT 'Policy check:' as check_type, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('users', 'subscriptions', 'emails_sent')
ORDER BY tablename, policyname;