-- Emergency fix for admin user
-- This ensures callum@paperplan.co has admin access

-- First, find the auth user ID for callum@paperplan.co
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'callum@paperplan.co'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Ensure user exists in public.users table
        INSERT INTO public.users (id, email, is_admin, plan, created_at)
        VALUES (admin_user_id, 'callum@paperplan.co', true, 'free', NOW())
        ON CONFLICT (id) DO UPDATE
        SET email = 'callum@paperplan.co',
            is_admin = true;
        
        RAISE NOTICE 'Admin user fixed: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users';
    END IF;
END $$;

-- Also ensure the trigger function doesn't override admin status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Only insert if user doesn't already exist
    INSERT INTO public.users (id, email, created_at)
    VALUES (new.id, new.email, now())
    ON CONFLICT (id) DO UPDATE
    SET email = new.email; -- Update email but preserve other fields like is_admin
    
    RETURN new;
END;
$$;

-- Verify the admin user
SELECT id, email, is_admin, plan, created_at 
FROM users 
WHERE email = 'callum@paperplan.co';