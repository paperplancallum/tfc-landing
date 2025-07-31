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
    const results = {
      live: [],
      test: []
    }

    // Get subscriptions from live mode
    if (stripeLive) {
      try {
        const subscriptions = await stripeLive.subscriptions.list({
          limit: 20,
          status: 'all'
        })
        
        for (const sub of subscriptions.data) {
          const customer = await stripeLive.customers.retrieve(sub.customer as string)
          
          results.live.push({
            subscription_id: sub.id,
            customer_id: sub.customer,
            customer_email: (customer as Stripe.Customer).email,
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            created: new Date(sub.created * 1000).toISOString(),
            price_id: sub.items.data[0]?.price.id,
            price_nickname: sub.items.data[0]?.price.nickname,
            interval: sub.items.data[0]?.price.recurring?.interval,
            interval_count: sub.items.data[0]?.price.recurring?.interval_count
          })
        }
      } catch (e) {
        console.error('Error listing live subscriptions:', e)
      }
    }

    // Get subscriptions from test mode
    if (stripeTest) {
      try {
        const subscriptions = await stripeTest.subscriptions.list({
          limit: 20,
          status: 'all'
        })
        
        for (const sub of subscriptions.data) {
          const customer = await stripeTest.customers.retrieve(sub.customer as string)
          
          results.test.push({
            subscription_id: sub.id,
            customer_id: sub.customer,
            customer_email: (customer as Stripe.Customer).email,
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            created: new Date(sub.created * 1000).toISOString(),
            price_id: sub.items.data[0]?.price.id,
            price_nickname: sub.items.data[0]?.price.nickname,
            interval: sub.items.data[0]?.price.recurring?.interval,
            interval_count: sub.items.data[0]?.price.recurring?.interval_count
          })
        }
      } catch (e) {
        console.error('Error listing test subscriptions:', e)
      }
    }

    return NextResponse.json({
      total_live: results.live.length,
      total_test: results.test.length,
      results
    })

  } catch (error: any) {
    console.error('Error listing subscriptions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list subscriptions' },
      { status: 500 }
    )
  }
}