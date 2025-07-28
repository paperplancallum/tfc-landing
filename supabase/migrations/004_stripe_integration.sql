-- Add Stripe integration fields

-- Add stripe_customer_id to users table
ALTER TABLE users 
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_email TEXT;

-- Add stripe fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN stripe_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_cancel_at_period_end BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_email ON users(stripe_email);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Create a function to handle user creation from Stripe
CREATE OR REPLACE FUNCTION create_user_from_stripe(
  p_email TEXT,
  p_stripe_customer_id TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    -- Create auth user with a random password (they'll use magic link to set it)
    v_user_id := gen_random_uuid();
    
    -- Note: In production, you'd use Supabase Admin API to create the auth user
    -- For now, we'll just create the profile
  END IF;
  
  -- Insert or update the user profile
  INSERT INTO users (id, email, stripe_customer_id, stripe_email, first_name, last_name, plan)
  VALUES (v_user_id, p_email, p_stripe_customer_id, p_email, p_first_name, p_last_name, 'premium')
  ON CONFLICT (id) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_email = EXCLUDED.stripe_email,
    plan = 'premium';
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;