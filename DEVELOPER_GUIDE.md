# Tom's Flight Club - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Payment Integration](#payment-integration)
8. [Email System](#email-system)
9. [Frontend Architecture](#frontend-architecture)
10. [Deployment Guide](#deployment-guide)
11. [Testing Guide](#testing-guide)
12. [Troubleshooting](#troubleshooting)

## Project Overview

Tom's Flight Club (TFC) is a Next.js 15 application that helps users discover ultra-cheap flight deals. It operates on a freemium model where free users get limited deals later in the day, while premium subscribers get early access to more deals.

### Tech Stack

- **Frontend**: Next.js 15.4.4 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Stripe (Subscriptions, Customer Portal)
- **Email**: Resend API
- **Deployment**: Vercel
- **Other**: React Email (templates), React Hook Form, Zod (validation)

### Key Features

1. **Deal Discovery**: Browse flight deals from various cities
2. **Multi-tier Access**: Free (limited) vs Premium (full access)
3. **Subscription Management**: Stripe-powered subscriptions
4. **Email Digests**: Automated daily/weekly deal emails
5. **Marketing Funnel**: 9-step conversion funnel
6. **Admin Panel**: Deal and user management
7. **Win-back Campaigns**: Automated re-engagement emails

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js App   │────▶│    Supabase     │     │     Stripe      │
│   (Frontend)    │     │   (Database)    │     │   (Payments)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Vercel      │     │  Supabase Auth │     │  Stripe Webhook │
│   (Hosting)     │     │    (Users)      │     │    (Events)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                             ┌─────────────────┐
│                 │                             │                 │
│   Vercel Cron   │                             │     Resend      │
│     (Jobs)      │                             │    (Emails)     │
│                 │                             │                 │
└─────────────────┘                             └─────────────────┘
```

### Request Flow

1. User visits site → Next.js app on Vercel
2. Auth check via middleware → Supabase Auth
3. Data fetching → Supabase Database
4. Payment processing → Stripe Checkout
5. Webhook events → Update user status
6. Scheduled emails → Vercel Cron → Email Service

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Resend account
- Vercel account (for deployment)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd tfc-landing
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` with:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key

   # Stripe (Test Mode)
   STRIPE_SECRET_KEY_TEST=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Stripe (Live Mode)
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET_LIVE=whsec_...

   # Stripe Price IDs (Test)
   NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_TEST=price_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_TEST=price_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_TEST=price_...

   # Stripe Price IDs (Live)
   NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_LIVE=price_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_LIVE=price_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_LIVE=price_...

   # Other
   RESEND_API_KEY=re_...
   CRON_SECRET=your-secret-key
   DEALS_WEBHOOK_SECRET=your-webhook-secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Database Setup**
   - Create a new Supabase project
   - Run migrations in order from `supabase/migrations/`
   - Enable RLS policies (included in migrations)

4. **Stripe Setup**
   - Create products and prices in Stripe Dashboard
   - Set up webhook endpoint pointing to `/api/webhooks/stripe`
   - For local testing, use Stripe CLI:
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Core Tables

#### `users`
Primary user table, references Supabase Auth
```sql
- id (UUID, PK, FK to auth.users)
- email (varchar)
- first_name (varchar)
- last_name (varchar)
- phone (varchar)
- home_city_id (UUID, FK to cities)
- plan ('free' | 'premium')
- stripe_customer_id (varchar)
- stripe_email (varchar)
- temp_password (varchar) - for Stripe checkout users
- password_reset_expires (timestamptz)
- account_created_via ('auth' | 'stripe')
- is_admin (boolean, default false)
- created_at (timestamptz)
```

#### `deals`
Flight deals data
```sql
- id (UUID, PK)
- from_airport_city (varchar)
- from_airport_code (varchar)
- from_airport_country (varchar)
- to_airport_city (varchar)
- to_airport_code (varchar)
- to_airport_country (varchar)
- price (varchar)
- currency (varchar)
- trip_duration (integer)
- departure_date (date)
- return_date (date)
- deal_found_date (date)
- airline (varchar)
- deal_source_url (text)
- photo_url (text)
- is_premium (boolean)
- created_at (timestamptz)
```

#### `subscriptions`
Stripe subscription tracking
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- stripe_subscription_id (varchar, unique)
- stripe_customer_id (varchar)
- plan_type (varchar)
- status (varchar)
- current_period_start (timestamptz)
- current_period_end (timestamptz)
- cancel_at_period_end (boolean)
- canceled_at (timestamptz)
- subscription_end_date (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `airports`
Airport and city information
```sql
- id (UUID, PK)
- iata_code (varchar, unique)
- name (varchar)
- city_name (varchar)
- city_country (varchar)
- region (varchar)
- city_image_url (text)
- city_id (UUID, FK to cities)
- is_primary (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `email_preferences`
User email settings
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- is_subscribed (boolean)
- email_frequency (enum)
- last_sent_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `email_logs`
Email send history
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- email_type (varchar)
- status (varchar)
- resend_id (varchar)
- error_message (text)
- metadata (jsonb)
- sent_at (timestamptz)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only view/update their own data
- Admin users (identified by email) bypass RLS
- Service role has full access
- Anonymous users can view non-premium deals

## API Documentation

### Authentication Endpoints

#### `POST /api/auth/set-password`
Set password for users created via Stripe checkout
```json
Request:
{
  "email": "user@example.com",
  "tempPassword": "TempPass123",
  "newPassword": "MySecurePassword"
}

Response:
{
  "success": true,
  "message": "Password set successfully",
  "user": {...}
}
```

### Subscription Management

#### `GET /api/subscription/status`
Get current user's subscription status
```json
Response:
{
  "hasSubscription": true,
  "subscription": {
    "id": "sub_...",
    "status": "active",
    "plan_type": "premium_year",
    "current_period_end": "2024-12-31T23:59:59Z",
    "cancel_at_period_end": false
  }
}
```

#### `POST /api/stripe/create-checkout`
Create Stripe checkout session
```json
Request:
{
  "plan": "premium_year",
  "email": "user@example.com", // optional
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}

Response:
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/...",
  "customerId": "cus_...",
  "isNewCustomer": false
}
```

#### `POST /api/stripe/create-portal-session`
Create Stripe customer portal session
```json
Response:
{
  "url": "https://billing.stripe.com/..."
}
```

### Webhook Endpoints

#### `POST /api/webhooks/stripe`
Stripe webhook handler
- Events handled:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

#### `POST /api/webhooks/deals`
Add new deals via webhook
```json
Request:
{
  "secret": "your-webhook-secret",
  "deals": [{
    "from_airport_city": "London",
    "from_airport_code": "LHR",
    "to_airport_city": "Barcelona",
    "to_airport_code": "BCN",
    "price": "29",
    "currency": "GBP",
    "trip_duration": 3,
    "departure_date": "2024-03-15",
    "return_date": "2024-03-18",
    "airline": "Ryanair",
    "deal_source_url": "https://..."
  }]
}
```

### Email Endpoints

#### `POST /api/email/bulk-send`
Send email digests (CRON job)
```json
Request Headers:
Authorization: Bearer <CRON_SECRET>

Request:
{
  "frequency": "daily" | "three_weekly" | "twice_weekly" | "weekly"
}

Response:
{
  "success": true,
  "results": {
    "sent": 150,
    "failed": 2
  }
}
```

### Admin Endpoints

All admin endpoints require authentication and admin status.

#### `GET /api/admin/stats`
Dashboard statistics
```json
Response:
{
  "users": {
    "total": 1234,
    "premium": 234,
    "free": 1000,
    "recentSignups": [...],
    "growthRate": 15.5
  },
  "subscriptions": {
    "active": 234,
    "canceled": 45,
    "revenue": {
      "mrr": 1170,
      "currency": "GBP"
    }
  },
  "deals": {
    "total": 5678,
    "today": 45,
    "premium": 2345
  }
}
```

#### `GET /api/admin/users/search`
Search users
```json
Query params: ?search=john&plan=premium&page=1&limit=20

Response:
{
  "users": [...],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

## Authentication & Authorization

### Authentication Flow

1. **Email/Password Sign Up**
   - User signs up via `/auth/signup`
   - Supabase Auth creates auth record
   - Trigger creates user profile
   - Email confirmation sent

2. **Stripe Checkout Sign Up**
   - User completes checkout without account
   - Webhook creates user with temp password
   - Welcome email sent with password link
   - User sets password and logs in

3. **Magic Link Login**
   - User requests magic link
   - Email sent via Supabase Auth
   - Click link to authenticate

### Middleware Protection

The middleware (`middleware.ts`) handles:
- Protected routes (`/account`, `/admin`)
- Admin route protection (email-based)
- Auth state management
- Redirect handling

### Admin Access

Admin access is controlled by:
1. Email whitelist in middleware (`callum@paperplan.co`)
2. `is_admin` field in database
3. RLS policies for admin operations

## Payment Integration

### Stripe Configuration

#### Products & Prices
```
3 Months: £7.99/month (billed £23.97)
6 Months: £5.99/month (billed £35.94)
Yearly: £4.99/month (billed £59.99)
```

#### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Subscription Lifecycle

1. **Creation**
   - User selects plan → Stripe Checkout
   - Webhook creates/updates subscription record
   - User upgraded to premium

2. **Management**
   - Customer portal for changes
   - Webhook syncs all changes
   - Plan downgrades at period end

3. **Cancellation**
   - Immediate downgrade to free
   - Win-back campaigns triggered
   - Reactivation possible with promo

### Price ID Mapping
```javascript
// Test Mode
'price_1RqiOkBgJmV3euWOeLd6799x': 'premium_3mo'
'price_1RqiOlBgJmV3euWOxHbNZBzO': 'premium_6mo'
'price_1RqiOlBgJmV3euWO7DfC4jJd': 'premium_year'

// Live Mode
'price_1RqiP1BgJmV3euWObFyWIYfT': 'premium_3mo'
'price_1RqiP1BgJmV3euWO2wuHsj73': 'premium_6mo'
'price_1RqiP2BgJmV3euWOSH8HzEXO': 'premium_year'
```

## Email System

### Email Templates

Located in `/emails/`:
- `welcome-new-subscriber.tsx` - New user welcome
- `deal-digest-free.tsx` - Free user daily digest
- `deal-digest-premium.tsx` - Premium user digest
- `subscription-expired.tsx` - Cancellation notice
- `win-back-campaign.tsx` - Re-engagement emails

### Email Service

The `EmailService` class handles:
- Bulk sending based on preferences
- Template selection by user tier
- Delivery tracking and logging
- Image optimization for emails

### CRON Jobs

Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/email/bulk-send?frequency=daily",
      "schedule": "0 9 * * *"  // 9 AM UTC daily
    },
    {
      "path": "/api/cron/win-back-campaigns",
      "schedule": "0 10 * * *" // 10 AM UTC daily
    }
  ]
}
```

### Win-back Campaigns

Automated sequence for canceled users:
- Day 3: "We miss you" + 20% off
- Day 7: "Special deals" + 30% off
- Day 14: "Last chance" + 40% off
- Day 30: Final offer + 50% off

## Frontend Architecture

### Page Structure

```
app/
├── (public)
│   ├── page.tsx              # Home page
│   ├── deals/[city]/         # City-specific deals
│   ├── join/                 # Pricing page
│   └── about/                # About page
├── (auth)
│   ├── auth/login/           # Login page
│   ├── auth/signup/          # Sign up page
│   └── auth/set-password/    # Password reset
├── (protected)
│   ├── account/              # User dashboard
│   └── admin/                # Admin panel
└── (marketing)
    └── funnel/               # 9-step funnel
        ├── step-1/ to step-8/
        └── checkout/
```

### Key Components

#### `PlanSelector`
Handles plan selection and checkout initiation
- Detects logged-in users
- Creates Stripe checkout sessions
- Handles loading states

#### `DealCard`
Displays individual deals
- Premium lock overlay for free users
- Responsive image loading
- Price formatting

#### `CitySelector`
Airport/city selection dropdown
- Searchable list
- Grouped by region
- Persists selection

#### `MembershipPanel`
Account page subscription display
- Current plan info
- Manage/cancel buttons
- Renewal dates

### State Management

- **Auth State**: Managed by Supabase Auth + middleware
- **User Data**: Server components fetch from Supabase
- **UI State**: Local component state (useState)
- **Form State**: React Hook Form + Zod validation

## Deployment Guide

### Vercel Deployment

1. **Connect GitHub Repository**
   - Import project in Vercel
   - Select framework: Next.js
   - Set root directory if needed

2. **Environment Variables**
   
   Add all variables from `.env.local` to Vercel:
   - Go to Project Settings → Environment Variables
   - Add each variable with appropriate scope:
     - Production: Live Stripe keys
     - Preview/Development: Test Stripe keys

3. **Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deployment**
   - Push to main branch triggers deployment
   - Preview deployments for PRs
   - Rollback available in dashboard

### Post-Deployment

1. **Configure Stripe Webhooks**
   - Add production endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events (checkout, subscription, invoice)
   - Save signing secret as `STRIPE_WEBHOOK_SECRET_LIVE`

2. **Verify CRON Jobs**
   - Check Functions tab in Vercel
   - Verify CRON jobs are scheduled
   - Monitor execution logs

3. **Test Critical Paths**
   - Sign up flow
   - Subscription purchase
   - Email delivery
   - Admin access

## Testing Guide

### Local Testing Setup

1. **Stripe CLI for Webhooks**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Test Data**
   - Use scripts in `/scripts/` for seeding
   - Test deals: `npm run seed:deals`
   - Test users: Create via UI

### Testing Scenarios

#### New User Subscription
1. Visit `/join`
2. Select plan → Stripe Checkout
3. Use test card `4242 4242 4242 4242`
4. Verify user created with premium access
5. Check welcome email sent

#### Subscription Cancellation
1. Log in as premium user
2. Go to `/account`
3. Click "Manage Subscription"
4. Cancel in Stripe portal
5. Verify downgrade to free

#### Email Delivery
1. Set user preferences to daily
2. Manually trigger: 
   ```bash
   curl -X POST http://localhost:3000/api/email/bulk-send \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"frequency": "daily"}'
   ```
3. Check Resend dashboard

#### Admin Functions
1. Log in with admin email
2. Access `/admin`
3. Test user search
4. View statistics
5. Check deal management

### Debug Endpoints

Development-only endpoints in `/api/debug/`:
- `check-user-by-email` - User details
- `list-all-subscriptions` - All subs
- `check-stripe-customer` - Stripe data
- `clear-test-subscriptions` - Cleanup

## Troubleshooting

### Common Issues

#### "Stripe not configured" Error
- Check environment variables are set
- Verify using correct key (test vs live)
- Ensure Stripe initialized in API route

#### Webhook Signature Verification Failed
- Check using correct webhook secret
- Verify test vs live mode match
- Ensure raw body parsing

#### User Can't Access Premium Content
- Check subscription status in database
- Verify `plan` field is 'premium'
- Check subscription end date
- Sync with Stripe if needed

#### Emails Not Sending
- Verify RESEND_API_KEY is set
- Check from address is verified domain
- Look for errors in Resend dashboard
- Check email preferences table

#### CRON Jobs Not Running
- Verify CRON_SECRET matches
- Check Vercel Functions logs
- Ensure proper authorization header
- Verify schedule syntax

### Database Queries for Debugging

```sql
-- Check user subscription status
SELECT u.*, s.* 
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'user@example.com';

-- Find failed email sends
SELECT * FROM email_logs
WHERE status = 'failed'
ORDER BY sent_at DESC
LIMIT 10;

-- Check recent subscription events
SELECT * FROM subscription_events
ORDER BY created_at DESC
LIMIT 20;

-- Verify admin access
SELECT id, email, is_admin 
FROM users 
WHERE is_admin = true;
```

### Monitoring

1. **Vercel Dashboard**
   - Function logs
   - Error tracking
   - Performance metrics

2. **Stripe Dashboard**
   - Webhook logs
   - Payment events
   - Subscription status

3. **Supabase Dashboard**
   - Database queries
   - Auth logs
   - Real-time subscriptions

4. **Resend Dashboard**
   - Email delivery
   - Bounce rates
   - Open tracking

## Development Workflow

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Testing Before Deploy
1. Run build locally: `npm run build`
2. Test critical user flows
3. Verify environment variables
4. Check for TypeScript errors
5. Review Vercel preview deployment

## Security Considerations

1. **API Security**
   - All sensitive endpoints check auth
   - Admin endpoints verify email
   - Webhook endpoints verify signatures
   - CRON endpoints check secret

2. **Database Security**
   - RLS policies on all tables
   - Service role only for webhooks
   - No client-side admin operations
   - Prepared statements prevent SQL injection

3. **Payment Security**
   - No card data stored
   - Stripe handles all payments
   - Webhook signature verification
   - Customer portal for changes

4. **Environment Variables**
   - Never commit secrets
   - Use different keys for environments
   - Rotate keys regularly
   - Audit access logs

---

## Quick Reference

### Key Files
- `middleware.ts` - Auth protection
- `lib/supabase/server.ts` - DB client
- `lib/stripe-helpers.ts` - Plan mapping
- `app/api/webhooks/stripe/route.ts` - Main webhook
- `components/plan-selector.tsx` - Checkout flow

### Important URLs
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com
- Resend Dashboard: https://resend.com
- Vercel Dashboard: https://vercel.com

### Support Contacts
- Technical issues: Create GitHub issue
- Stripe support: https://support.stripe.com
- Supabase support: https://supabase.com/support

---

*Last updated: January 2025*