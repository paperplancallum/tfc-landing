import { CurrencyCode } from '@/components/currency-selector'

export interface PlanPricing {
  monthly: string
  total: string
  totalAmount: number // For Stripe (in cents)
  savings?: number
}

export interface PricingPlan {
  id: string
  name: string
  interval: '3mo' | '6mo' | 'year'
  pricing: PlanPricing
  featured?: boolean
  badge?: string
}

export interface CurrencyPricing {
  currency: CurrencyCode
  symbol: string
  plans: {
    '3mo': PlanPricing
    '6mo': PlanPricing
    'year': PlanPricing
  }
}

export const PRICING_DATA: Record<CurrencyCode, CurrencyPricing> = {
  GBP: {
    currency: 'GBP',
    symbol: '£',
    plans: {
      '3mo': { 
        monthly: '7.99', 
        total: '23.97',
        totalAmount: 2397
      },
      '6mo': { 
        monthly: '5.99', 
        total: '35.94',
        totalAmount: 3594,
        savings: 25 
      },
      'year': { 
        monthly: '4.99', 
        total: '59.88',
        totalAmount: 5988,
        savings: 37 
      }
    }
  },
  USD: {
    currency: 'USD',
    symbol: '$',
    plans: {
      '3mo': { 
        monthly: '9.99', 
        total: '29.97',
        totalAmount: 2997
      },
      '6mo': { 
        monthly: '7.99', 
        total: '47.94',
        totalAmount: 4794,
        savings: 20 
      },
      'year': { 
        monthly: '5.99', 
        total: '71.88',
        totalAmount: 7188,
        savings: 40 
      }
    }
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    plans: {
      '3mo': { 
        monthly: '8.99', 
        total: '26.97',
        totalAmount: 2697
      },
      '6mo': { 
        monthly: '6.99', 
        total: '41.94',
        totalAmount: 4194,
        savings: 22 
      },
      'year': { 
        monthly: '5.49', 
        total: '65.88',
        totalAmount: 6588,
        savings: 39 
      }
    }
  }
}

// Helper function to get formatted plans for display
export function getFormattedPlans(currency: CurrencyCode): PricingPlan[] {
  const data = PRICING_DATA[currency]
  const symbol = data.symbol
  
  return [
    {
      id: 'premium_3mo',
      name: '3 Months',
      interval: '3mo',
      pricing: {
        ...data.plans['3mo'],
        monthly: `${symbol}${data.plans['3mo'].monthly}`,
        total: `${symbol}${data.plans['3mo'].total}`
      }
    },
    {
      id: 'premium_6mo',
      name: '6 Months',
      interval: '6mo',
      pricing: {
        ...data.plans['6mo'],
        monthly: `${symbol}${data.plans['6mo'].monthly}`,
        total: `${symbol}${data.plans['6mo'].total}`
      }
    },
    {
      id: 'premium_year',
      name: 'Yearly',
      interval: 'year',
      pricing: {
        ...data.plans['year'],
        monthly: `${symbol}${data.plans['year'].monthly}`,
        total: `${symbol}${data.plans['year'].total}`
      },
      featured: true,
      badge: 'MOST POPULAR'
    }
  ]
}

// Get the billing description for a plan
export function getBillingDescription(planId: string, currency: CurrencyCode): string {
  const data = PRICING_DATA[currency]
  const symbol = data.symbol
  
  switch (planId) {
    case 'premium_3mo':
      return `${symbol}${data.plans['3mo'].total} billed quarterly`
    case 'premium_6mo':
      return `${symbol}${data.plans['6mo'].total} billed every 6 months`
    case 'premium_year':
      return `${symbol}${data.plans['year'].total} billed annually`
    default:
      return ''
  }
}