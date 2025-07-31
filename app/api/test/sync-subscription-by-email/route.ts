import { NextRequest, NextResponse } from 'next/server'
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

    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create service role client
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get user profile by email
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: `User not found with email: ${email}` }, { status: 404 })
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 10
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No Stripe customer found for this email' }, { status: 404 })
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
      .eq('id', profile.id)

    // Delete any old test subscriptions
    await serviceSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', profile.id)

    // Create new subscription record - use only the columns that exist in the base schema
    const { data: newSub, error } = await serviceSupabase
      .from('subscriptions')
      .insert({
        user_id: profile.id,
        stripe_sub_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        plan
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
        plan,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    })

  } catch (error: any) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}