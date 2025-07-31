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

    // Force update with the correct customer ID
    const correctCustomerId = 'cus_SmI4T5US2IItuG'
    
    // Update user with correct customer ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_customer_id: correctCustomerId })
      .eq('id', user.id)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update customer ID: ' + updateError.message }, { status: 500 })
    }

    // Now fetch the subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: correctCustomerId,
      status: 'all',
      limit: 5
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        message: 'Customer ID updated but no subscriptions found',
        customerId: correctCustomerId,
        subscriptions: []
      })
    }

    // Get the most recent subscription
    const subscription = subscriptions.data[0]
    
    // Check if subscription already exists in DB
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (existingSub) {
      // Update existing subscription
      const { data: updated, error } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
        })
        .eq('stripe_subscription_id', subscription.id)
        .select()
        .single()
      
      return NextResponse.json({
        message: 'Subscription updated',
        subscription: updated,
        stripeData: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }
      })
    } else {
      // Create new subscription record
      const { data: newSub, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to create subscription: ' + error.message }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Subscription created successfully',
        subscription: newSub,
        stripeData: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          allSubscriptions: subscriptions.data.map(s => ({
            id: s.id,
            status: s.status,
            created: new Date(s.created * 1000).toISOString()
          }))
        }
      })
    }

  } catch (error: any) {
    console.error('Error fixing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix subscription' },
      { status: 500 }
    )
  }
}