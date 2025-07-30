-- Migration to add subscription lifecycle management fields

-- Add fields to users table for password management
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_created_via VARCHAR(50) DEFAULT 'signup'; -- 'signup', 'stripe', 'google', etc.

-- Add fields to subscriptions table for better tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_failed_date TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- Create win-back campaigns table
CREATE TABLE IF NOT EXISTS win_back_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    campaign_type VARCHAR(50) NOT NULL, -- 'day_3', 'day_7', 'day_14', 'day_30'
    discount_percentage INTEGER NOT NULL,
    stripe_coupon_id VARCHAR(255),
    stripe_promo_code VARCHAR(255) UNIQUE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription events table for tracking all changes
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'created', 'activated', 'cancelled', 'expired', 'reactivated', 'payment_failed', etc.
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_temp_password ON users(temp_password) WHERE temp_password IS NOT NULL;
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
CREATE INDEX idx_subscriptions_end_date ON subscriptions(subscription_end_date);
CREATE INDEX idx_subscriptions_status_end_date ON subscriptions(status, subscription_end_date);
CREATE INDEX idx_win_back_user_id ON win_back_campaigns(user_id);
CREATE INDEX idx_win_back_expires ON win_back_campaigns(expires_at);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_created ON subscription_events(created_at);

-- Update RLS policies
ALTER TABLE win_back_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own win-back campaigns
CREATE POLICY "Users can view own win-back campaigns" ON win_back_campaigns
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own subscription events
CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all records
CREATE POLICY "Service role can manage win-back campaigns" ON win_back_campaigns
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage subscription events" ON subscription_events
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Function to generate secure temporary password
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to track subscription events
CREATE OR REPLACE FUNCTION track_subscription_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscription_events (user_id, subscription_id, event_type, event_data)
    VALUES (
        NEW.user_id,
        NEW.id,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN OLD.status != NEW.status THEN 'status_changed'
            ELSE 'updated'
        END,
        jsonb_build_object(
            'old_status', OLD.status,
            'new_status', NEW.status,
            'plan', NEW.plan,
            'operation', TG_OP
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription events
CREATE TRIGGER track_subscription_changes
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION track_subscription_event();