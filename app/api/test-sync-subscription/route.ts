import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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
    const { customerId, userEmail } = body
    
    if (!customerId || !userEmail) {
      return NextResponse.json({ error: 'customerId and userEmail are required' }, { status: 400 })
    }

    // Create service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get user by email
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found with email: ' + userEmail }, { status: 404 })
    }

    // Try to find the customer and subscription in both live and test mode
    let customer = null
    let subscription = null
    let mode = null
    let stripe = null

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
          stripe = stripeLive
        }
      } catch (e) {
        console.log('Customer not found in live mode:', e)
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
          stripe = stripeTest
        }
      } catch (e) {
        console.log('Customer not found in test mode:', e)
      }
    }

    if (!customer) {
      return NextResponse.json({ 
        error: 'Customer not found in either live or test mode',
        customer_id_searched: customerId
      }, { status: 404 })
    }

    if (!subscription) {
      return NextResponse.json({ 
        error: 'No subscription found for customer',
        customer: {
          id: customer.id,
          email: customer.email,
          mode
        }
      }, { status: 404 })
    }

    // Update user with stripe customer ID
    const { data: updatedUser } = await serviceSupabase
      .from('users')
      .update({ 
        stripe_customer_id: customer.id,
        stripe_email: customer.email || profile.email
      })
      .eq('id', profile.id)
      .select()
      .single()

    // Check if subscription already exists
    const { data: existingSub } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    // Determine plan type from price
    let plan = 'premium'
    if (subscription.items.data.length > 0) {
      const price = subscription.items.data[0].price
      const interval = price.recurring?.interval
      const intervalCount = price.recurring?.interval_count
      
      if (interval === 'month' && intervalCount === 3) {
        plan = 'premium_3mo'
      } else if (interval === 'month' && intervalCount === 6) {
        plan = 'premium_6mo'
      } else if (interval === 'year' && intervalCount === 1) {
        plan = 'premium_year'
      }
    }

    if (existingSub) {
      // Update existing subscription
      const { data: updated } = await serviceSupabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
          cancellation_date: subscription.cancel_at_period_end ? new Date().toISOString() : null,
          subscription_end_date: subscription.cancel_at_period_end 
            ? new Date(subscription.current_period_end * 1000).toISOString() 
            : null,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          plan
        })
        .eq('id', existingSub.id)
        .select()
        .single()
      
      // Also update user plan
      await serviceSupabase
        .from('users')
        .update({ plan })
        .eq('id', profile.id)
      
      return NextResponse.json({
        message: 'Subscription updated from Stripe',
        mode,
        user: updatedUser,
        subscription: updated,
        stripe_data: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          plan
        }
      })
    } else {
      // Create new subscription record
      const { data: newSub, error } = await serviceSupabase
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          stripe_sub_id: subscription.id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
          plan,
          cancellation_date: subscription.cancel_at_period_end ? new Date().toISOString() : null,
          subscription_end_date: subscription.cancel_at_period_end 
            ? new Date(subscription.current_period_end * 1000).toISOString() 
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

      // Also update user plan
      await serviceSupabase
        .from('users')
        .update({ plan })
        .eq('id', profile.id)

      return NextResponse.json({
        message: 'Subscription synced from Stripe',
        mode,
        user: updatedUser,
        subscription: newSub,
        customer: {
          id: customer.id,
          email: customer.email
        },
        stripe_data: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          price_id: subscription.items.data[0]?.price.id,
          price_nickname: subscription.items.data[0]?.price.nickname,
          product_id: subscription.items.data[0]?.price.product,
          plan
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