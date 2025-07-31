import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripeTest = process.env.STRIPE_SECRET_KEY_TEST
  ? new Stripe(process.env.STRIPE_SECRET_KEY_TEST, { apiVersion: '2024-12-18.acacia' })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripeTest) {
      return NextResponse.json({ error: 'Stripe test mode not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { email, plan = 'premium_3mo' } = body

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

    // Map plan to price ID
    const priceMap = {
      'premium_3mo': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_TEST,
      'premium_6mo': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_TEST,
      'premium_year': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_TEST
    }

    const priceId = priceMap[plan as keyof typeof priceMap]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Check for existing customer
    let stripeCustomer = null
    if (profile.stripe_customer_id) {
      try {
        stripeCustomer = await stripeTest.customers.retrieve(profile.stripe_customer_id)
      } catch (e) {
        console.log('Existing customer not found, will create new')
      }
    }

    // Search by email if no customer ID
    if (!stripeCustomer) {
      const customers = await stripeTest.customers.list({
        email: email,
        limit: 1
      })
      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0]
      }
    }

    // Create customer if needed
    if (!stripeCustomer) {
      stripeCustomer = await stripeTest.customers.create({
        email: email,
        metadata: {
          user_id: profile.id
        }
      })

      // Update user profile with customer ID
      await serviceSupabase
        .from('users')
        .update({ 
          stripe_customer_id: stripeCustomer.id,
          stripe_email: email 
        })
        .eq('id', profile.id)
    }

    // Check for existing subscriptions
    const existingSubs = await stripeTest.subscriptions.list({
      customer: stripeCustomer.id,
      status: 'active'
    })

    if (existingSubs.data.length > 0) {
      return NextResponse.json({
        message: 'Customer already has an active subscription',
        customer: {
          id: stripeCustomer.id,
          email: stripeCustomer.email
        },
        existing_subscription: {
          id: existingSubs.data[0].id,
          status: existingSubs.data[0].status,
          current_period_end: new Date(existingSubs.data[0].current_period_end * 1000).toISOString()
        }
      })
    }

    // Create subscription with trial
    const subscription = await stripeTest.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: priceId }],
      trial_period_days: 3,
      metadata: {
        user_id: profile.id,
        plan
      }
    })

    // Delete any existing mock subscriptions
    await serviceSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', profile.id)
      .or('stripe_sub_id.like.sub_mock_%,stripe_subscription_id.like.sub_mock_%')

    // Create subscription record in database
    const { data: subRecord, error: subError } = await serviceSupabase
      .from('subscriptions')
      .insert({
        user_id: profile.id,
        stripe_sub_id: subscription.id,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_cancel_at_period_end: false,
        plan
      })
      .select()
      .single()

    if (subError) {
      console.error('Subscription insert error:', subError)
      
      // If insert fails due to duplicate, update existing
      const { data: existingRec } = await serviceSupabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', subscription.id)
        .single()
      
      if (existingRec) {
        const { data: updated } = await serviceSupabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_cancel_at_period_end: false,
            plan
          })
          .eq('id', existingRec.id)
          .select()
          .single()
        
        subRecord = updated
      }
    }

    // Update user plan
    await serviceSupabase
      .from('users')
      .update({ plan })
      .eq('id', profile.id)

    return NextResponse.json({
      message: 'Test subscription created successfully',
      customer: {
        id: stripeCustomer.id,
        email: stripeCustomer.email
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
      },
      database_record: subRecord,
      plan,
      price_id: priceId
    })

  } catch (error: any) {
    console.error('Error creating test subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}