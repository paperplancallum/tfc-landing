# Testing Subscription Lifecycle System

## 1. Stripe Webhook Testing (Local Development)

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login
```

### Forward webhooks to local environment
```bash
# In a separate terminal, run:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret and add to .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Test webhook events
```bash
# Test successful subscription creation
stripe trigger checkout.session.completed

# Test subscription cancellation
stripe trigger customer.subscription.deleted

# Test failed payment
stripe trigger invoice.payment_failed
```

## 2. Test New Subscriber Flow

### A. Create a new test user
1. Go to `/join` page
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiry date and any CVC
4. Complete checkout

### Expected Results:
- New user created in database with temporary password
- Welcome email sent with temporary password
- User redirected to `/auth/set-password` page
- After setting password, user logged in automatically

## 3. Test Password Setting

### Direct URL test:
```
http://localhost:3000/auth/set-password?email=test@example.com&token=TempPass123
```

### API test:
```bash
curl -X POST http://localhost:3000/api/auth/set-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "tempPassword": "TempPass123",
    "newPassword": "MyNewPassword123"
  }'
```

## 4. Test Subscription Status API

### Get current subscription:
```bash
# First, get auth token by logging in
# Then use it in the request:
curl http://localhost:3000/api/subscription/status \
  -H "Cookie: [your-auth-cookie]"
```

## 5. Test Win-Back Campaigns

### Manually trigger test campaign:
```bash
# Add this test endpoint temporarily to win-back-service.ts:
# GET /api/test/win-back?email=user@example.com&campaign=day_3
```

### Test cron job:
```bash
curl http://localhost:3000/api/cron/win-back-campaigns \
  -H "Authorization: Bearer ijzob3oatjwC3pmpfpHUynt2A79FV570qtorAqtOE"
```

## 6. Test Subscription Cancellation

### Via API:
```bash
curl -X POST http://localhost:3000/api/subscription/cancel-feedback \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "reason": "too_expensive",
    "feedback": "I found it too costly for my needs",
    "otherReason": ""
  }'
```

## 7. Test Reactivation with Promo Code

### Via API:
```bash
curl -X POST http://localhost:3000/api/subscription/reactivate \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "promoCode": "COMEBACK20_ABC123"
  }'
```

## 8. Database Verification Queries

Run these in Supabase SQL editor:

```sql
-- Check subscription events
SELECT * FROM subscription_events 
WHERE user_id = '[user-id]' 
ORDER BY created_at DESC;

-- Check win-back campaigns
SELECT * FROM win_back_campaigns 
WHERE user_id = '[user-id]';

-- Check user subscription status
SELECT u.*, s.* 
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'test@example.com';

-- Check expired subscriptions for win-back
SELECT * FROM subscriptions 
WHERE status = 'canceled' 
AND subscription_end_date > NOW() - INTERVAL '30 days'
AND subscription_end_date < NOW();
```

## 9. Email Testing

### Check Resend dashboard:
1. Go to https://resend.com/emails
2. Verify emails are being sent:
   - Welcome email with temp password
   - Subscription expired notification
   - Win-back campaign emails

### Test email rendering:
```bash
# Start email preview server
npm run email:dev

# Visit http://localhost:3001
# Check all email templates render correctly
```

## 10. End-to-End Test Scenarios

### Scenario 1: New Premium Subscriber
1. Sign up at `/join`
2. Complete Stripe checkout
3. Check email for welcome + temp password
4. Click link to set password
5. Verify logged in and premium access

### Scenario 2: Subscription Expiration
1. In Stripe dashboard, cancel a subscription
2. Wait for webhook or manually trigger
3. Check user receives expiration email
4. Verify user downgraded to free plan
5. Check win-back campaigns sent on schedule

### Scenario 3: Win-Back Redemption
1. As expired user, receive win-back email
2. Click promo code link
3. Complete checkout with discount
4. Verify subscription reactivated
5. Check campaign marked as redeemed

## 11. Production Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Configure Stripe webhook endpoint in production
- [ ] Update NEXT_PUBLIC_BASE_URL
- [ ] Test cron job authorization
- [ ] Verify email sending works
- [ ] Check Stripe API keys are production keys
- [ ] Monitor first few real subscriptions

## Common Issues & Debugging

### Webhook not received:
- Check Stripe CLI is running
- Verify webhook secret is correct
- Check ngrok if testing remotely

### Emails not sending:
- Verify RESEND_API_KEY is set
- Check from email is verified domain
- Look for errors in console

### Subscription not updating:
- Check Stripe webhook logs
- Verify database RLS policies
- Check for TypeScript errors

### Win-back not sending:
- Verify cron job is running
- Check subscription dates in database
- Look for existing campaigns