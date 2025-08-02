import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Use test key in development, live key in production
const stripeKey = process.env.NODE_ENV === 'development' 
  ? process.env.STRIPE_SECRET_KEY_TEST 
  : process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

// Map price IDs to your product prices with currency support
const PRICE_MAP = {
  'premium_3mo': {
    GBP: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_TEST || 'price_test_3months',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_LIVE || 'price_live_3months'
    },
    USD: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_USD_TEST || 'price_test_3months_usd',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_USD_LIVE || 'price_live_3months_usd'
    },
    EUR: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_EUR_TEST || 'price_test_3months_eur',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_EUR_LIVE || 'price_live_3months_eur'
    }
  },
  'premium_6mo': {
    GBP: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_TEST || 'price_test_6months',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_LIVE || 'price_live_6months'
    },
    USD: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_USD_TEST || 'price_test_6months_usd',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_USD_LIVE || 'price_live_6months_usd'
    },
    EUR: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_EUR_TEST || 'price_test_6months_eur',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_EUR_LIVE || 'price_live_6months_eur'
    }
  },
  'premium_year': {
    GBP: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_TEST || 'price_test_yearly',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_LIVE || 'price_live_yearly'
    },
    USD: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_USD_TEST || 'price_test_yearly_usd',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_USD_LIVE || 'price_live_yearly_usd'
    },
    EUR: {
      test: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_EUR_TEST || 'price_test_yearly_eur',
      live: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_EUR_LIVE || 'price_live_yearly_eur'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const { email, plan, currency = 'GBP', successUrl, cancelUrl } = await request.json()

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    // Validate currency
    if (!['GBP', 'USD', 'EUR'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }
    
    // Check if this is test mode
    const isTestMode = stripeKey?.startsWith('sk_test_')
    
    // Get the appropriate price ID
    const priceId = PRICE_MAP[plan as keyof typeof PRICE_MAP]?.[currency as 'GBP' | 'USD' | 'EUR']?.[isTestMode ? 'test' : 'live']
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or currency selected' }, { status: 400 })
    }

    // Get authenticated user if any
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Search for existing customer by email (only if email provided)
    let stripeCustomerId: string | undefined
    if (email) {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 10
      })

      if (existingCustomers.data.length > 0) {
        // Prefer customer with active subscriptions
        let customerWithSub = null
        for (const customer of existingCustomers.data) {
          const subs = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1
          })
          if (subs.data.length > 0) {
            customerWithSub = customer
            break
          }
        }
        
        // Use customer with subscription, or the most recent one
        stripeCustomerId = customerWithSub?.id || existingCustomers.data[0].id
        console.log('Using existing customer:', stripeCustomerId)
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${request.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.headers.get('origin')}/join`,
      metadata: {
        plan,
        currency,
        user_id: user?.id || '',
        email
      },
      subscription_data: {
        metadata: {
          plan,
          user_id: user?.id || '',
          email
        }
      }
    }

    // If we have an existing customer, use it
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId
      // Also update customer email if needed
      await stripe.customers.update(stripeCustomerId, {
        email,
        metadata: {
          user_id: user?.id || '',
          last_checkout: new Date().toISOString()
        }
      })
    } else if (email) {
      // If we have an email but no existing customer, pre-fill it
      sessionParams.customer_email = email
    }
    // If no email provided, Stripe checkout will collect it

    // If user is logged in, save the Stripe customer ID
    if (user && stripeCustomerId) {
      await supabase
        .from('users')
        .update({ 
          stripe_customer_id: stripeCustomerId,
          stripe_email: email 
        })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      customerId: stripeCustomerId,
      isNewCustomer: !stripeCustomerId
    })

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}