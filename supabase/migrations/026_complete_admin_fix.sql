-- Complete fix for admin access and RLS policies

-- 1. First, temporarily disable RLS to fix everything
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent DISABLE ROW LEVEL SECURITY;

-- 2. Ensure admin user exists with correct data
INSERT INTO users (id, email, is_admin, plan, created_at)
SELECT 
    id,
    email,
    true as is_admin,
    'free' as plan,
    NOW() as created_at
FROM auth.users
WHERE email = 'callum@paperplan.co'
ON CONFLICT (id) DO UPDATE
SET is_admin = true,
    email = 'callum@paperplan.co';

-- 3. Drop ALL existing policies to start completely fresh
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

-- 4. Create simple, working RLS policies
-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Basic policy: Users can see their own record
CREATE POLICY "users_select_own" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Basic policy: Users can update their own record
CREATE POLICY "users_update_own" ON users
    FOR UPDATE 
    USING (auth.uid() = id);

-- Basic policy: Allow inserts for new users
CREATE POLICY "users_insert_own" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Admin policy: Admins can see all records (using a subquery to avoid recursion)
CREATE POLICY "admin_select_all" ON users
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE email = 'callum@paperplan.co'
        )
    );

-- Admin policy: Admins can update all records
CREATE POLICY "admin_update_all" ON users
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE email = 'callum@paperplan.co'
        )
    );

-- Service role policy
CREATE POLICY "service_role_all" ON users
    FOR ALL 
    USING (
        current_setting('request.jwt.claim.role', true) = 'service_role'
    );

-- 5. Fix other table policies if they exist
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;

-- Create basic policies for subscriptions
CREATE POLICY "subscriptions_user_select" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin_select" ON subscriptions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE email = 'callum@paperplan.co'
        )
    );

-- Create basic policies for emails_sent
CREATE POLICY "emails_user_select" ON emails_sent
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "emails_admin_select" ON emails_sent
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE email = 'callum@paperplan.co'
        )
    );

-- 6. Verify the fix
SELECT 
    u.id,
    u.email,
    u.is_admin,
    au.id as auth_id,
    au.email as auth_email
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'callum@paperplan.co';

-- 7. Test that policies work
-- This should return the admin user
SELECT * FROM users WHERE email = 'callum@paperplan.co';