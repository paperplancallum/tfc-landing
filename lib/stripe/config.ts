import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-28.acacia',
});

// Stripe Product IDs (to be set after creating products)
export const STRIPE_PRODUCTS = {
  PREMIUM_3_MONTHS: process.env.STRIPE_PREMIUM_3_MONTHS_PRICE_ID!,
  PREMIUM_6_MONTHS: process.env.STRIPE_PREMIUM_6_MONTHS_PRICE_ID!,
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
};

// Subscription intervals
export const SUBSCRIPTION_INTERVALS = {
  QUARTERLY: { interval: 'month' as const, interval_count: 3 },
  BIANNUAL: { interval: 'month' as const, interval_count: 6 },
  YEARLY: { interval: 'year' as const, interval_count: 1 },
};