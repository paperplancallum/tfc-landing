# Deployment Checklist - Environment Variables Migration

## Pre-Deployment Steps

### 1. Backup Current Configuration
- [ ] Screenshot current Vercel environment variables
- [ ] Export current environment variables if possible
- [ ] Document which deployment is currently using which variables

### 2. Clean Up Vercel Environment Variables

#### Remove These Variables:
- [ ] `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTH_`
- [ ] `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTH_`
- [ ] `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY`
- [ ] Any duplicate entries with different casing
- [ ] Old payment link variables (we're using Price IDs now)

### 3. Add/Update Environment Variables in Vercel

#### Test Variables (Development & Preview Environments):
- [ ] `STRIPE_SECRET_KEY_TEST` = `<YOUR_STRIPE_TEST_SECRET_KEY>`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST` = `pk_test_51RppX1BgJmV3euWOMeDzfAwlfWBubFdas0ZvKIYFcDMakfGL5d3rRxKmvXjbfSdHDVywz66KDgQ8v7EeXMwr2Edw00klzbMPFS`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_TEST` = `price_1RqiOkBgJmV3euWOeLd6799x`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_TEST` = `price_1RqiOlBgJmV3euWOxHbNZBzO`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_TEST` = `price_1RqiOlBgJmV3euWO7DfC4jJd`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_m36sICKdfgm0zqr9MTAf8BPQziukSe3F`

#### Live Variables (Production Environment):
- [ ] `STRIPE_SECRET_KEY` = `<YOUR_STRIPE_LIVE_SECRET_KEY>`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_51RppX1BgJmV3euWOezFieam7w4parcwvLT7O6c4OX5L6caRfFPp2l48g5U9WOxQy7a3yy91LLWLZXRVFPs5ghXIB00VB7RAgPp`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_LIVE` = `price_1RqiP1BgJmV3euWObFyWIYfT`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_LIVE` = `price_1RqiP1BgJmV3euWO2wuHsj73`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_LIVE` = `price_1RqiP2BgJmV3euWOSH8HzEXO`
- [ ] `STRIPE_WEBHOOK_SECRET_LIVE` = `whsec_KgZMVWsDgrnByRoo9SewaQL8CN3IJq9p`

#### Other Variables (All Environments):
- [ ] Verify `SUPABASE_SERVICE_KEY` is set
- [ ] Verify `RESEND_API_KEY` is set
- [ ] Update `DEALS_WEBHOOK_SECRET` with a secure value
- [ ] Verify `UNSPLASH_ACCESS_KEY` is set
- [ ] Update `CRON_SECRET` with a secure value
- [ ] Ensure `NEXT_PUBLIC_BASE_URL` is set to `https://tomsflightclub.com` for production

### 4. Git Preparation
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Update `vercel-env-setup.md` with correct values
- [ ] Remove any hardcoded Stripe keys from the codebase
- [ ] Commit all pending changes

### 5. Deployment Steps
1. [ ] Push changes to Git
2. [ ] Trigger deployment in Vercel
3. [ ] Monitor deployment logs for any environment variable errors

### 6. Post-Deployment Verification
- [ ] Test payment flow in development environment
- [ ] Test payment flow in preview environment
- [ ] Verify webhook endpoints are receiving events
- [ ] Check Stripe dashboard for successful test transactions
- [ ] Monitor error logs for any environment variable issues

### 7. Production Deployment
- [ ] After successful testing, deploy to production
- [ ] Test one live transaction with a small amount
- [ ] Verify webhook is working in production
- [ ] Monitor for 24 hours for any issues

## Important Notes

1. **Security**: Never commit secret keys to Git
2. **Testing**: Always test in development/preview before production
3. **Webhooks**: Ensure webhook endpoints match in Stripe dashboard
4. **Rollback Plan**: Keep backup of old environment variables for quick rollback

## Environment Variable Reference

### Naming Convention:
- Test variables: End with `_TEST`
- Live variables: No suffix (except `STRIPE_WEBHOOK_SECRET_LIVE`)
- Public variables: Start with `NEXT_PUBLIC_`

### Variable Scope:
- Development/Preview: Use `_TEST` variables
- Production: Use live variables (no `_TEST` suffix)