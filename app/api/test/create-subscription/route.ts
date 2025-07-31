import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan = 'premium_3mo' } = body

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
        email: user.email!,
        limit: 1
      })
      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0]
      }
    }

    // Create customer if needed
    if (!stripeCustomer) {
      stripeCustomer = await stripeTest.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id
        }
      })

      // Update user profile with customer ID
      await serviceSupabase
        .from('users')
        .update({ 
          stripe_customer_id: stripeCustomer.id,
          stripe_email: user.email 
        })
        .eq('id', user.id)
    }

    // Create subscription
    const subscription = await stripeTest.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: priceId }],
      metadata: {
        user_id: user.id,
        plan
      }
    })

    // Create subscription record in database
    const { data: subRecord, error: subError } = await serviceSupabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
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
      // If insert fails, try update
      const { data: updated } = await serviceSupabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: false,
          plan
        })
        .eq('stripe_subscription_id', subscription.id)
        .select()
        .single()

      if (updated) {
        subRecord = updated
      }
    }

    // Update user plan
    await serviceSupabase
      .from('users')
      .update({ plan })
      .eq('id', user.id)

    return NextResponse.json({
      message: 'Test subscription created successfully',
      customer: {
        id: stripeCustomer.id,
        email: stripeCustomer.email
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      },
      database_record: subRecord,
      plan
    })

  } catch (error: any) {
    console.error('Error creating test subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}