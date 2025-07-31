import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.plan !== 'premium') {
      return NextResponse.json({ error: 'User is not premium' }, { status: 400 })
    }

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingSub) {
      return NextResponse.json({ 
        message: 'Subscription already exists',
        subscription: existingSub 
      })
    }

    // Try to find subscription in Stripe
    let foundSubscription = null
    
    // First try by customer ID if available
    if (profile.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 1
      })

      if (subscriptions.data.length > 0) {
        foundSubscription = subscriptions.data[0]
      }
    }
    
    // If not found by customer ID, try searching by email
    if (!foundSubscription && profile.email) {
      // Search for customers by email
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 10
      })
      
      // Check each customer for active subscriptions
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 1
        })
        
        if (subs.data.length > 0) {
          foundSubscription = subs.data[0]
          
          // Update the user's stripe_customer_id if it was missing
          if (!profile.stripe_customer_id) {
            await supabase
              .from('users')
              .update({ stripe_customer_id: customer.id })
              .eq('id', user.id)
          }
          break
        }
      }
    }
    
    if (foundSubscription) {
      // Create subscription record
      const { data: newSub, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_subscription_id: foundSubscription.id,
          status: foundSubscription.status,
          stripe_current_period_end: new Date(foundSubscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: foundSubscription.cancel_at_period_end || false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Subscription created',
        subscription: newSub,
        stripeData: {
          id: foundSubscription.id,
          status: foundSubscription.status,
          cancel_at_period_end: foundSubscription.cancel_at_period_end,
          current_period_end: new Date(foundSubscription.current_period_end * 1000).toISOString()
        }
      })
    }

    // Get debug info about customers and their subscriptions
    let customerInfo = []
    if (profile.email) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 10
      })
      
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 5
        })
        
        customerInfo.push({
          id: customer.id,
          email: customer.email,
          created: new Date(customer.created * 1000).toISOString(),
          subscriptions: subs.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            created: new Date(sub.created * 1000).toISOString()
          }))
        })
      }
    }
    
    return NextResponse.json({ 
      error: 'No subscription found in Stripe',
      profile: {
        email: profile.email,
        stripe_customer_id: profile.stripe_customer_id
      },
      stripeCustomers: customerInfo,
      debug: {
        hasStripeCustomerId: !!profile.stripe_customer_id,
        searchedByEmail: !!profile.email,
        totalCustomersFound: customerInfo.length,
        customersWithSubscriptions: customerInfo.filter(c => c.subscriptions.length > 0).length
      }
    }, { status: 404 })

  } catch (error: any) {
    console.error('Error fixing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix subscription' },
      { status: 500 }
    )
  }
}