'use client'

// Client-side configuration for payment links
export function getPlanConfigs() {
  // Always use test links in development
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  
  return {
    useTestMode: isDevelopment,
    plans: [
      {
        id: 'premium_3mo',
        name: '3 Months',
        price: '$7.99',
        period: '/month',
        total: '$23.97 billed quarterly',
        featured: false,
        stripeLink: isDevelopment
          ? 'https://buy.stripe.com/test_3cI6oG3T599Pfr28VG5J600'
          : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS || 'https://buy.stripe.com/3cI6oG3T599Pfr28VG5J600',
      },
      {
        id: 'premium_year',
        name: 'Yearly',
        price: '$4.99',
        period: '/month',
        total: '$59.99 billed annually',
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
        price: '$5.99',
        period: '/month',
        total: '$35.94 billed every 6 months',
        featured: false,
        stripeLink: isDevelopment
          ? 'https://buy.stripe.com/test_fZu6oG4X92Lr5Qsfk45J601'
          : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS || 'https://buy.stripe.com/fZu6oG4X92Lr5Qsfk45J601',
      },
    ]
  }
}