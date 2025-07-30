-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create a proper admin policy that doesn't cause recursion
-- First, ensure the user can always read their own record
CREATE POLICY "Users can always view own record" ON users
    FOR SELECT USING (auth.uid() = id);

-- For admin access to other users, we need a different approach
-- We'll create a function that safely checks admin status
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    -- Direct query without RLS to avoid recursion
    SELECT is_admin INTO admin_status
    FROM users
    WHERE id = user_id;
    
    RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the admin policies using the function
CREATE POLICY "Admins can view all users except self" ON users
    FOR SELECT USING (
        auth.uid() != id AND is_admin(auth.uid())
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        is_admin(auth.uid())
    );

-- Also ensure the user exists in the users table
-- This will create the user if they don't exist when they log in
INSERT INTO users (id, email, is_admin)
VALUES ('f4971052-2457-4e91-a717-4140709aceb9', 'callum@paperplan.co', true)
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Make sure the email is also updated in case it's different
UPDATE users SET email = 'callum@paperplan.co' WHERE id = 'f4971052-2457-4e91-a717-4140709aceb9';