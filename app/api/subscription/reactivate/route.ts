import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export async function POST(request: NextRequest) {
  try {
    const { promoCode } = await request.json()
    
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
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Verify user is on free plan
    if (dbUser.plan !== 'free') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }
    
    // If promo code provided, verify it's valid for this user
    if (promoCode) {
      const { data: campaign } = await supabase
        .from('win_back_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .eq('stripe_promo_code', promoCode)
        .eq('redeemed', false)
        .single()
      
      if (!campaign) {
        return NextResponse.json(
          { error: 'Invalid or expired promo code' },
          { status: 400 }
        )
      }
      
      // Check if promo code hasn't expired
      if (new Date(campaign.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Promo code has expired' },
          { status: 400 }
        )
      }
    }
    
    // Get or create Stripe customer
    let stripeCustomerId = dbUser.stripe_customer_id
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: {
          user_id: user.id,
        },
      })
      
      stripeCustomerId = customer.id
      
      // Update user with stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }
    
    // Create checkout session
    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?reactivated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/join`,
      metadata: {
        user_id: user.id,
        reactivation: 'true',
        promo_code: promoCode || '',
      },
    }
    
    // Apply promo code if provided
    if (promoCode) {
      // Find the promotion code in Stripe
      const promotionCodes = await stripe.promotionCodes.list({
        code: promoCode,
        limit: 1,
      })
      
      if (promotionCodes.data.length > 0) {
        checkoutSessionParams.discounts = [
          {
            promotion_code: promotionCodes.data[0].id,
          },
        ]
      }
    }
    
    const session = await stripe.checkout.sessions.create(checkoutSessionParams)
    
    // Log reactivation attempt
    await supabase
      .from('subscription_events')
      .insert({
        user_id: user.id,
        event_type: 'reactivation_attempted',
        event_data: {
          promo_code: promoCode || null,
          checkout_session_id: session.id,
        },
      })
    
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Error creating reactivation session:', error)
    return NextResponse.json(
      { error: 'Failed to create reactivation session' },
      { status: 500 }
    )
  }
}