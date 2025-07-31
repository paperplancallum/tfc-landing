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

    // Manually use the correct customer ID
    const correctCustomerId = 'cus_SmI4T5US2IItuG'

    // Fetch the subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: correctCustomerId,
      status: 'all',
      limit: 5
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        error: 'No subscriptions found for customer',
        customerId: correctCustomerId
      }, { status: 404 })
    }

    // Get the most recent subscription
    const subscription = subscriptions.data[0]
    
    // Delete any existing subscription records for this user
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)
    
    // Create new subscription record
    const { data: newSub, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
        // Add any other required fields based on the schema
        stripe_sub_id: subscription.id, // In case this is the actual column name
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        plan: 'premium' // Assuming this might be required
      })
      .select()
      .single()

    if (error) {
      // Try with minimal fields
      const { data: minimalSub, error: minimalError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_sub_id: subscription.id, // Try alternate column name
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .select()
        .single()
      
      if (minimalError) {
        return NextResponse.json({ 
          error: 'Failed to create subscription',
          details: minimalError.message,
          hint: minimalError.hint,
          code: minimalError.code,
          attemptedData: {
            user_id: user.id,
            subscription_id: subscription.id,
            status: subscription.status
          }
        }, { status: 500 })
      }
      
      return NextResponse.json({
        message: 'Subscription created with minimal fields',
        subscription: minimalSub,
        stripeData: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }
      })
    }

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: newSub,
      stripeData: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null
      }
    })

  } catch (error: any) {
    console.error('Error fixing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix subscription' },
      { status: 500 }
    )
  }
}