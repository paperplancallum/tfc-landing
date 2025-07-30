-- Add fields for custom email confirmation
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_confirmation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_confirmation_expires TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- Create index for token lookup
CREATE INDEX IF NOT EXISTS idx_users_email_confirmation_token 
ON users(email_confirmation_token) 
WHERE email_confirmation_token IS NOT NULL;