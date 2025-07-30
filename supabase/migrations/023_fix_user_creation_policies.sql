-- Fix user creation policies
-- First, check existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Allow users to create their own profile when signing up
CREATE POLICY "Users can create own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to create users (for Stripe webhook)
CREATE POLICY "Service role bypass" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure the insert policy exists for the auth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (new.id, new.email, now())
    ON CONFLICT (id) DO UPDATE SET email = new.email;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();