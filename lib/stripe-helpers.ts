import Stripe from 'stripe'

// Map of Stripe price IDs to plan types
const PRICE_TO_PLAN_MAP: Record<string, string> = {
  // Test mode price IDs (GBP - Paperplan)
  'price_1RqiOkBgJmV3euWOeLd6799x': 'premium_3mo',
  'price_1RqiOlBgJmV3euWOxHbNZBzO': 'premium_6mo', 
  'price_1RqiOlBgJmV3euWO7DfC4jJd': 'premium_year',
  // Alternative test price IDs (if multiple products exist)
  'price_1RqiO7BgJmV3euWOMnQ6IsNg': 'premium_3mo',
  'price_1RqiO7BgJmV3euWOYEwcgNLt': 'premium_6mo',
  'price_1RqiO7BgJmV3euWOsaCDclFt': 'premium_year',
  
  // Live mode price IDs (GBP - Paperplan)
  'price_1RqiP1BgJmV3euWObFyWIYfT': 'premium_3mo',
  'price_1RqiP1BgJmV3euWO2wuHsj73': 'premium_6mo',
  'price_1RqiP2BgJmV3euWOSH8HzEXO': 'premium_year',
}

/**
 * Determine the plan type from a Stripe subscription
 */
export function getPlanFromSubscription(subscription: Stripe.Subscription): string {
  // First try to get from metadata if you set it
  if (subscription.metadata?.plan_type) {
    return subscription.metadata.plan_type
  }
  
  // Otherwise, look at the price ID of the first item
  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id
    const plan = PRICE_TO_PLAN_MAP[priceId]
    if (plan) return plan
    
    // Try to infer from price nickname or product name
    const price = subscription.items.data[0].price
    if (price.nickname) {
      if (price.nickname.toLowerCase().includes('3 month')) return 'premium_3mo'
      if (price.nickname.toLowerCase().includes('6 month')) return 'premium_6mo'
      if (price.nickname.toLowerCase().includes('year')) return 'premium_year'
    }
  }
  
  // Default to generic premium if we can't determine
  return 'premium'
}

/**
 * Determine plan from payment link URL or product metadata
 */
export function getPlanFromPaymentLink(url: string): string {
  // Map payment link IDs to plans
  const PAYMENT_LINK_MAP: Record<string, string> = {
    '5J600': 'premium_3mo',  // Last part of your 3-month link
    '5J601': 'premium_6mo',  // Last part of your 6-month link
    '5J602': 'premium_year', // Last part of your yearly link
  }
  
  // Extract the last segment of the payment link
  const matches = url.match(/([A-Za-z0-9]+)$/)?.[1]
  if (matches && PAYMENT_LINK_MAP[matches]) {
    return PAYMENT_LINK_MAP[matches]
  }
  
  return 'premium'
}