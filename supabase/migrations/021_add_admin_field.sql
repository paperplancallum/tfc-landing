-- Add admin field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin users
CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Set callum@paperplan.co as admin
UPDATE users SET is_admin = true WHERE email = 'callum@paperplan.co';

-- Add RLS policy for admin access
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow admins to view all subscription events (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_events') THEN
        CREATE POLICY "Admins can view all subscription events" ON subscription_events
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;

-- Allow admins to view all win-back campaigns (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'win_back_campaigns') THEN
        CREATE POLICY "Admins can view all win-back campaigns" ON win_back_campaigns
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;

-- Allow admins to view all emails sent
CREATE POLICY "Admins can view all emails sent" ON emails_sent
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );