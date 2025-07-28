# Tom's Flight Club - Deal Discovery Web App

A NextJS application for discovering ultra-cheap flight deals with a freemium subscription model.

## Features

- 🛫 Browse flight deals from various departure cities
- 💎 Premium membership with early access to deals
- 📧 Daily email digests with personalized deals
- 💳 Stripe integration for subscription payments
- 🔐 Authentication with Supabase Auth
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe
- **Deployment**: Vercel

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration script in `supabase/migrations/001_initial_schema.sql`
3. Enable Row Level Security (RLS) - already configured in the migration

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
app/
├── auth/
│   ├── login/
│   ├── signup/
│   └── verify-email/
├── deals/
│   └── [city]/
├── join/
├── account/
├── about/
└── page.tsx (home)

components/
├── ui/
├── navbar.tsx
├── deal-card.tsx
├── city-selector.tsx
└── ...

lib/
├── supabase/
├── stripe/
└── utils.ts
```

## Key Features Implementation

### Authentication Flow
- Email/password and magic link authentication
- Protected routes with middleware
- User profile creation on signup

### Subscription Tiers
- **Free**: 3 daily deals at 10 AM
- **Premium**: 9 daily deals at 7 AM, exclusive deals

### Deal Management
- City-based deal filtering
- Premium-only deals with lock UI for free users
- Real-time updates from Supabase

## Next Steps

1. **Stripe Integration**: Implement checkout flow and webhook handling
2. **Account Management**: Build user profile and subscription management pages
3. **Email System**: Set up daily digest emails with Supabase Edge Functions
4. **Admin Panel**: Create deal management interface
5. **Analytics**: Implement tracking for user events

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Edge Functions

Deploy email worker:
```bash
supabase functions deploy send-daily-digest
```

## License

MIT