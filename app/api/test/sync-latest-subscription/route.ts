import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getPlanFromSubscription } from '@/lib/stripe-helpers'

const stripeKey = process.env.NODE_ENV === 'development' 
  ? process.env.STRIPE_SECRET_KEY_TEST 
  : process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create service role client
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

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 10
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No Stripe customer found for your email' }, { status: 404 })
    }

    // Get the most recent customer
    const customer = customers.data[0]

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 })
    }

    // Get the most recent subscription
    const subscription = subscriptions.data[0]
    const plan = getPlanFromSubscription(subscription)

    // Update user with customer ID
    await serviceSupabase
      .from('users')
      .update({ 
        stripe_customer_id: customer.id,
        stripe_email: customer.email,
        plan: 'premium'
      })
      .eq('id', user.id)

    // Check if subscription already exists
    const { data: existingSub } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!existingSub) {
      // Create subscription record
      const { data: newSub, error } = await serviceSupabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_sub_id: subscription.id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
          plan,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ 
          error: 'Failed to create subscription record',
          details: error 
        }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Subscription synced successfully',
        subscription: newSub,
        customer: {
          id: customer.id,
          email: customer.email
        },
        stripe_subscription: {
          id: subscription.id,
          status: subscription.status,
          plan
        }
      })
    } else {
      // Update existing subscription
      const { data: updated } = await serviceSupabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
          plan
        })
        .eq('id', existingSub.id)
        .select()
        .single()

      return NextResponse.json({
        message: 'Subscription updated successfully',
        subscription: updated,
        customer: {
          id: customer.id,
          email: customer.email
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