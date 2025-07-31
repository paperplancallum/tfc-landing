# Vercel Environment Variables Setup Guide

## Required Environment Variables

Copy and paste these environment variables into your Vercel project settings:

### 1. Stripe TEST Mode Variables
```
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS_TEST=https://buy.stripe.com/test_3cI6oG3T599Pfr28VG5J600
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS_TEST=https://buy.stripe.com/test_fZu6oG4X92Lr5Qsfk45J601
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY_TEST=https://buy.stripe.com/test_4gM3cuexJ1Hn0w80pa5J602
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_51RppX1BgJmV3euWOMeDzfAwlfWBubFdas0ZvKIYFcDMakfGL5d3rRxKmvXjbfSdHDVywz66KDgQ8v7EeXMwr2Edw00klzbMPFS
STRIPE_SECRET_KEY_TEST=<YOUR_STRIPE_TEST_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=whsec_m36sICKdfgm0zqr9MTAf8BPQziukSe3F
```

### 2. Stripe LIVE Mode Variables
```
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS=https://buy.stripe.com/3cI6oG3T599Pfr28VG5J600
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS=https://buy.stripe.com/fZu6oG4X92Lr5Qsfk45J601
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=https://buy.stripe.com/4gM3cuexJ1Hn0w80pa5J602
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RppX1BgJmV3euWOezFieam7w4parcwvLT7O6c4OX5L6caRfFPp2l48g5U9WOxQy7a3yy91LLWLZXRVFPs5ghXIB00VB7RAgPp
STRIPE_SECRET_KEY=<YOUR_STRIPE_LIVE_SECRET_KEY>
STRIPE_WEBHOOK_SECRET_LIVE=whsec_KgZMVWsDgrnByRoo9SewaQL8CN3IJq9p
```

### 3. Other Required Variables
```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaG9vdWd4aHBha29tdnh4bGdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY5NjE4NywiZXhwIjoyMDY5MjcyMTg3fQ.wqUA5t95GrLSfCieNESsV0ybz_uDP3Lh3qHJnhhFaFw
RESEND_API_KEY=re_HeQBsdwN_8NRKjtLwoP9ni39U9Q7hkHCx
DEALS_WEBHOOK_SECRET=your-secret-key-here-change-this-in-production
UNSPLASH_ACCESS_KEY=EYPD40GFLf5lBYwsTvqHFoNwuqM7ZF9XrTbIYJyhA8c
CRON_SECRET=ijzob3oatjwC3pmpfpHUynt2A79FV570qtorAqtOE
```

### 4. Public Variables (already in Vercel, no change needed)
```
NEXT_PUBLIC_SUPABASE_URL=https://tihoougxhpakomvxxlgl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaG9vdWd4aHBha29tdnh4bGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTYxODcsImV4cCI6MjA2OTI3MjE4N30._QImUG48fKs46reTyGj4PcGJCdj76YuYObmDgDtQLHM
NEXT_PUBLIC_BASE_URL=https://tomsflightclub.com
```

## How to Add to Vercel

1. Go to your Vercel Dashboard
2. Select your project (tfc-landing)
3. Navigate to Settings → Environment Variables
4. For each variable:
   - Enter the Key (e.g., `STRIPE_SECRET_KEY_TEST`)
   - Enter the Value (the corresponding value from above)
   - Select environments:
     - For `_TEST` variables: Select "Development" and "Preview"
     - For LIVE variables (without `_TEST`): Select "Production"
     - For other variables: Select all environments
5. Click "Save" after each variable

## Important Notes

- **DO NOT** commit secret keys to Git
- The payment links will automatically use test links in development and live links in production
- Make sure webhook endpoints are configured in both test and live Stripe dashboards
- After updating variables, redeploy your site for changes to take effect

## Webhook Configuration in Stripe

### Test Mode Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://tomsflightclub.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Live Mode Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://tomsflightclub.com/api/webhooks/stripe`
3. Select same events as test mode
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET_LIVE`