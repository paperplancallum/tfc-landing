import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize both test and live Stripe instances
const stripeLive = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

const stripeTest = process.env.STRIPE_SECRET_KEY_TEST
  ? new Stripe(process.env.STRIPE_SECRET_KEY_TEST, { apiVersion: '2024-12-18.acacia' })
  : null

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const mode = url.searchParams.get('mode') || 'test'
    
    const stripe = mode === 'live' ? stripeLive : stripeTest
    
    if (!stripe) {
      return NextResponse.json({ error: `Stripe ${mode} not configured` }, { status: 503 })
    }

    // List all active prices
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100
    })

    // Filter for subscription prices
    const subscriptionPrices = prices.data.filter(price => price.type === 'recurring')

    // Format the response
    const formattedPrices = subscriptionPrices.map(price => {
      const product = price.product as Stripe.Product
      return {
        id: price.id,
        nickname: price.nickname,
        unit_amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        interval_count: price.recurring?.interval_count,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active
        }
      }
    })

    // Group by product
    const groupedByProduct = formattedPrices.reduce((acc, price) => {
      const productName = price.product.name
      if (!acc[productName]) {
        acc[productName] = []
      }
      acc[productName].push(price)
      return acc
    }, {} as Record<string, typeof formattedPrices>)

    return NextResponse.json({
      mode,
      total_prices: formattedPrices.length,
      prices: formattedPrices,
      grouped_by_product: groupedByProduct,
      suggested_env_vars: generateEnvVars(formattedPrices, mode)
    })

  } catch (error: any) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

function generateEnvVars(prices: any[], mode: string) {
  const envVars: string[] = []
  const modePrefix = mode === 'test' ? 'TEST' : 'LIVE'
  
  prices.forEach(price => {
    const interval = price.interval
    const intervalCount = price.interval_count
    
    let planType = ''
    if (interval === 'month' && intervalCount === 3) {
      planType = '3MO'
    } else if (interval === 'month' && intervalCount === 6) {
      planType = '6MO'
    } else if (interval === 'year' && intervalCount === 1) {
      planType = 'YEAR'
    }
    
    if (planType) {
      envVars.push(`NEXT_PUBLIC_STRIPE_PRICE_ID_${planType}_${modePrefix}=${price.id}`)
    }
  })
  
  return envVars
}