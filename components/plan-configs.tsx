'use client'

import { CurrencyCode } from './currency-selector'

// Client-side configuration for payment links
export function getPlanConfigs(currency: CurrencyCode = 'GBP') {
  // Always use test links in development
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  
  // For now, return GBP links until Stripe links are created for other currencies
  // This is only used as a fallback if the checkout API fails
  return {
    useTestMode: isDevelopment,
    currency,
    plans: [
      {
        id: 'premium_3mo',
        name: '3 Months',
        price: getPriceForCurrency('3mo', currency),
        period: '/month',
        total: getTotalForCurrency('3mo', currency),
        featured: false,
        stripeLink: isDevelopment
          ? 'https://buy.stripe.com/test_3cI6oG3T599Pfr28VG5J600'
          : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS || 'https://buy.stripe.com/3cI6oG3T599Pfr28VG5J600',
      },
      {
        id: 'premium_year',
        name: 'Yearly',
        price: getPriceForCurrency('year', currency),
        period: '/month',
        total: getTotalForCurrency('year', currency),
        featured: true,
        badge: 'MOST POPULAR',
        savings: 'BEST VALUE',
        stripeLink: isDevelopment
          ? 'https://buy.stripe.com/test_4gM3cuexJ1Hn0w80pa5J602'
          : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY || 'https://buy.stripe.com/4gM3cuexJ1Hn0w80pa5J602',
      },
      {
        id: 'premium_6mo',
        name: '6 Months',
        price: getPriceForCurrency('6mo', currency),
        period: '/month',
        total: getTotalForCurrency('6mo', currency),
        featured: false,
        stripeLink: isDevelopment
          ? 'https://buy.stripe.com/test_fZu6oG4X92Lr5Qsfk45J601'
          : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS || 'https://buy.stripe.com/fZu6oG4X92Lr5Qsfk45J601',
      },
    ]
  }
}

function getPriceForCurrency(plan: '3mo' | '6mo' | 'year', currency: CurrencyCode): string {
  const prices = {
    GBP: { '3mo': '£7.99', '6mo': '£5.99', 'year': '£4.99' },
    USD: { '3mo': '$9.99', '6mo': '$7.99', 'year': '$5.99' },
    EUR: { '3mo': '€8.99', '6mo': '€6.99', 'year': '€5.49' }
  }
  return prices[currency][plan]
}

function getTotalForCurrency(plan: '3mo' | '6mo' | 'year', currency: CurrencyCode): string {
  const totals = {
    GBP: { 
      '3mo': '£23.97 billed quarterly',
      '6mo': '£35.94 billed every 6 months',
      'year': '£59.99 billed annually'
    },
    USD: {
      '3mo': '$29.97 billed quarterly',
      '6mo': '$47.94 billed every 6 months',
      'year': '$71.88 billed annually'
    },
    EUR: {
      '3mo': '€26.97 billed quarterly',
      '6mo': '€41.94 billed every 6 months',
      'year': '€65.88 billed annually'
    }
  }
  return totals[currency][plan]
}