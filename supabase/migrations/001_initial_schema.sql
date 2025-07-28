-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cities table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    iata_code VARCHAR(3) NOT NULL UNIQUE,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    home_city_id UUID REFERENCES cities(id),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    plan_renews_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    departure_city_id UUID NOT NULL REFERENCES cities(id),
    destination VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    currency CHAR(3) DEFAULT 'GBP',
    trip_length INTEGER NOT NULL,
    travel_month VARCHAR(20) NOT NULL,
    photo_url TEXT,
    found_at TIMESTAMPTZ DEFAULT NOW(),
    is_premium BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_sub_id VARCHAR(255) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('premium_3mo', 'premium_6mo', 'premium_year')),
    status VARCHAR(50) NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emails_sent table
CREATE TABLE emails_sent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template VARCHAR(100) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    open_at TIMESTAMPTZ,
    click_at TIMESTAMPTZ
);

-- Create analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_deals_departure_city ON deals(departure_city_id);
CREATE INDEX idx_deals_found_at ON deals(found_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for deals
CREATE POLICY "Anyone can view non-premium deals" ON deals
    FOR SELECT USING (is_premium = false);

CREATE POLICY "Premium users can view all deals" ON deals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.plan = 'premium'
        )
    );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for emails_sent
CREATE POLICY "Users can view own emails" ON emails_sent
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for analytics
CREATE POLICY "Anyone can insert analytics" ON analytics
    FOR INSERT WITH CHECK (true);

-- Insert sample cities
INSERT INTO cities (name, iata_code, timezone) VALUES
    ('London', 'LON', 'Europe/London'),
    ('New York', 'NYC', 'America/New_York'),
    ('Paris', 'PAR', 'Europe/Paris'),
    ('Tokyo', 'TYO', 'Asia/Tokyo'),
    ('Sydney', 'SYD', 'Australia/Sydney'),
    ('Dubai', 'DXB', 'Asia/Dubai'),
    ('Singapore', 'SIN', 'Asia/Singapore'),
    ('Los Angeles', 'LAX', 'America/Los_Angeles'),
    ('Berlin', 'BER', 'Europe/Berlin'),
    ('Toronto', 'YTO', 'America/Toronto');