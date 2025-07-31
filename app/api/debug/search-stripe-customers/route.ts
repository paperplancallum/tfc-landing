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
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const results = {
      live: [],
      test: []
    }

    // Search in live mode
    if (stripeLive) {
      try {
        const customers = await stripeLive.customers.list({
          email,
          limit: 100
        })
        
        for (const customer of customers.data) {
          const subscriptions = await stripeLive.subscriptions.list({
            customer: customer.id,
            limit: 10
          })
          
          results.live.push({
            id: customer.id,
            email: customer.email,
            created: new Date(customer.created * 1000).toISOString(),
            subscriptions: subscriptions.data.map(sub => ({
              id: sub.id,
              status: sub.status,
              cancel_at_period_end: sub.cancel_at_period_end,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              price_id: sub.items.data[0]?.price.id,
              price_nickname: sub.items.data[0]?.price.nickname
            }))
          })
        }
      } catch (e) {
        console.error('Error searching live customers:', e)
      }
    }

    // Search in test mode
    if (stripeTest) {
      try {
        const customers = await stripeTest.customers.list({
          email,
          limit: 100
        })
        
        for (const customer of customers.data) {
          const subscriptions = await stripeTest.subscriptions.list({
            customer: customer.id,
            limit: 10
          })
          
          results.test.push({
            id: customer.id,
            email: customer.email,
            created: new Date(customer.created * 1000).toISOString(),
            subscriptions: subscriptions.data.map(sub => ({
              id: sub.id,
              status: sub.status,
              cancel_at_period_end: sub.cancel_at_period_end,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              price_id: sub.items.data[0]?.price.id,
              price_nickname: sub.items.data[0]?.price.nickname
            }))
          })
        }
      } catch (e) {
        console.error('Error searching test customers:', e)
      }
    }

    return NextResponse.json({
      email_searched: email,
      results
    })

  } catch (error: any) {
    console.error('Error searching customers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search customers' },
      { status: 500 }
    )
  }
}