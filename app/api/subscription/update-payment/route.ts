import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing not available' },
        { status: 503 }
      )
    }
    
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user details
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!dbUser || !dbUser.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No payment method on file' },
        { status: 404 }
      )
    }
    
    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Create a session for updating payment method
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: dbUser.stripe_customer_id,
      setup_intent_data: {
        metadata: {
          user_id: user.id,
          subscription_id: subscription.id,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?payment_updated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
    })
    
    // Log payment update attempt
    await supabase
      .from('subscription_events')
      .insert({
        user_id: user.id,
        event_type: 'payment_method_update_initiated',
        event_data: {
          subscription_id: subscription.id,
          checkout_session_id: session.id,
        },
      })
    
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Error creating payment update session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment update session' },
      { status: 500 }
    )
  }
}