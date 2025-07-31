import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize both test and live Stripe instances
const stripeLive = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

const stripeTest = process.env.STRIPE_SECRET_KEY_TEST
  ? new Stripe(process.env.STRIPE_SECRET_KEY_TEST, { apiVersion: '2024-12-18.acacia' })
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId } = body
    
    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }

    // Try to find the customer in both live and test mode
    let customer = null
    let subscription = null
    let mode = null

    // Try live mode first
    if (stripeLive) {
      try {
        customer = await stripeLive.customers.retrieve(customerId)
        const subscriptions = await stripeLive.subscriptions.list({
          customer: customerId,
          limit: 1
        })
        if (subscriptions.data.length > 0) {
          subscription = subscriptions.data[0]
          mode = 'live'
        }
      } catch (e) {
        console.log('Customer not found in live mode')
      }
    }

    // Try test mode if not found in live
    if (!customer && stripeTest) {
      try {
        customer = await stripeTest.customers.retrieve(customerId)
        const subscriptions = await stripeTest.subscriptions.list({
          customer: customerId,
          limit: 1
        })
        if (subscriptions.data.length > 0) {
          subscription = subscriptions.data[0]
          mode = 'test'
        }
      } catch (e) {
        console.log('Customer not found in test mode')
      }
    }

    if (!customer) {
      return NextResponse.json({ 
        error: 'Customer not found in either live or test mode',
        customer_id_searched: customerId
      }, { status: 404 })
    }

    // Determine plan type from subscription
    let plan = null
    if (subscription && subscription.items.data.length > 0) {
      const price = subscription.items.data[0].price
      const interval = price.recurring?.interval
      const intervalCount = price.recurring?.interval_count
      
      if (interval === 'month' && intervalCount === 3) {
        plan = 'premium_3mo'
      } else if (interval === 'month' && intervalCount === 6) {
        plan = 'premium_6mo'
      } else if (interval === 'year' && intervalCount === 1) {
        plan = 'premium_year'
      } else {
        plan = 'premium'
      }
    }

    return NextResponse.json({
      mode,
      customer: {
        id: customer.id,
        email: customer.email,
        created: new Date(customer.created * 1000).toISOString(),
        metadata: customer.metadata
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        price_id: subscription.items.data[0]?.price.id,
        price_nickname: subscription.items.data[0]?.price.nickname,
        interval: subscription.items.data[0]?.price.recurring?.interval,
        interval_count: subscription.items.data[0]?.price.recurring?.interval_count,
        detected_plan: plan
      } : null
    })

  } catch (error: any) {
    console.error('Error checking customer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check customer' },
      { status: 500 }
    )
  }
}