import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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

    // Create service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get user profile
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({
      email: profile.email,
      limit: 10
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        searched_email: profile.email
      }, { status: 404 })
    }

    // Find customer with active subscription
    let activeSubscription = null
    let customerWithSub = null
    
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      })
      
      if (subscriptions.data.length > 0) {
        activeSubscription = subscriptions.data[0]
        customerWithSub = customer
        break
      }
    }

    if (!activeSubscription || !customerWithSub) {
      // Check for any subscription (not just active)
      for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 1
        })
        
        if (subscriptions.data.length > 0) {
          activeSubscription = subscriptions.data[0]
          customerWithSub = customer
          break
        }
      }
      
      if (!activeSubscription) {
        return NextResponse.json({ 
          error: 'No subscriptions found for any customer',
          customers_checked: customers.data.map(c => ({
            id: c.id,
            email: c.email,
            created: new Date(c.created * 1000).toISOString()
          }))
        }, { status: 404 })
      }
    }

    // Update user with stripe customer ID if missing
    if (!profile.stripe_customer_id) {
      await serviceSupabase
        .from('users')
        .update({ stripe_customer_id: customerWithSub.id })
        .eq('id', user.id)
    }

    // Check if subscription already exists
    const { data: existingSub } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', activeSubscription.id)
      .single()

    if (existingSub) {
      // Update existing subscription
      const { data: updated } = await serviceSupabase
        .from('subscriptions')
        .update({
          status: activeSubscription.status,
          stripe_current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: activeSubscription.cancel_at_period_end || false,
          cancellation_date: activeSubscription.cancel_at_period_end ? new Date().toISOString() : null,
          subscription_end_date: activeSubscription.cancel_at_period_end 
            ? new Date(activeSubscription.current_period_end * 1000).toISOString() 
            : null
        })
        .eq('id', existingSub.id)
        .select()
        .single()
      
      return NextResponse.json({
        message: 'Subscription updated from Stripe',
        subscription: updated,
        stripe_data: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          cancel_at_period_end: activeSubscription.cancel_at_period_end,
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString()
        }
      })
    } else {
      // Create new subscription record
      const { data: newSub, error } = await serviceSupabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_sub_id: activeSubscription.id,
          stripe_subscription_id: activeSubscription.id,
          status: activeSubscription.status,
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: activeSubscription.cancel_at_period_end || false,
          plan: 'premium', // You may want to determine this from the subscription
          cancellation_date: activeSubscription.cancel_at_period_end ? new Date().toISOString() : null,
          subscription_end_date: activeSubscription.cancel_at_period_end 
            ? new Date(activeSubscription.current_period_end * 1000).toISOString() 
            : null
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ 
          error: 'Failed to create subscription',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Subscription synced from Stripe',
        subscription: newSub,
        customer: {
          id: customerWithSub.id,
          email: customerWithSub.email
        },
        stripe_data: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          cancel_at_period_end: activeSubscription.cancel_at_period_end,
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          price_id: activeSubscription.items.data[0]?.price.id,
          product_id: activeSubscription.items.data[0]?.price.product
        }
      })
    }

  } catch (error: any) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}