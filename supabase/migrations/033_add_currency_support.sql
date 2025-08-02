-- Add currency support to users and subscriptions tables

-- Add preferred currency to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'GBP'
CHECK (preferred_currency IN ('GBP', 'USD', 'EUR'));

-- Add currency to subscriptions table to track what currency was used for payment
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'GBP'
CHECK (currency IN ('GBP', 'USD', 'EUR'));

-- Add currency to subscription history for tracking
ALTER TABLE subscription_history 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'GBP'
CHECK (currency IN ('GBP', 'USD', 'EUR'));

-- Create index for faster queries by currency
CREATE INDEX IF NOT EXISTS idx_users_preferred_currency ON users(preferred_currency);
CREATE INDEX IF NOT EXISTS idx_subscriptions_currency ON subscriptions(currency);

-- Add comment for documentation
COMMENT ON COLUMN users.preferred_currency IS 'User''s preferred currency for pricing display (GBP, USD, EUR)';
COMMENT ON COLUMN subscriptions.currency IS 'Currency used for this subscription payment';
COMMENT ON COLUMN subscription_history.currency IS 'Currency used for this subscription period';

-- Update existing records to have explicit GBP currency (since all existing are in GBP)
UPDATE subscriptions SET currency = 'GBP' WHERE currency IS NULL;
UPDATE subscription_history SET currency = 'GBP' WHERE currency IS NULL;