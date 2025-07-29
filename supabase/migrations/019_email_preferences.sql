-- Create email preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (email_frequency IN ('never', 'daily', 'three_weekly', 'twice_weekly', 'weekly')),
  is_subscribed BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index for efficient querying
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX idx_email_preferences_frequency ON email_preferences(email_frequency) WHERE is_subscribed = true;
CREATE INDEX idx_email_preferences_last_sent ON email_preferences(last_sent_at) WHERE is_subscribed = true;

-- Add RLS policies
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own email preferences
CREATE POLICY "Users can view own email preferences" ON email_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences" ON email_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences" ON email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id, email_frequency, is_subscribed)
  VALUES (NEW.id, 'daily', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add email preferences when a new user is created
CREATE TRIGGER create_email_preferences_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();

-- Create email send history table for tracking and debugging
CREATE TABLE IF NOT EXISTS email_send_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('digest_free', 'digest_premium')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deal_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  resend_id TEXT
);

-- Create indexes for email history
CREATE INDEX idx_email_history_user_id ON email_send_history(user_id);
CREATE INDEX idx_email_history_sent_at ON email_send_history(sent_at);
CREATE INDEX idx_email_history_status ON email_send_history(status);

-- Add RLS policies for email history
ALTER TABLE email_send_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own email history
CREATE POLICY "Users can view own email history" ON email_send_history
  FOR SELECT USING (auth.uid() = user_id);