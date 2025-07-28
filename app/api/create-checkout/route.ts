import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe only if secret key is available
const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

// Map plan IDs to price IDs
const PRICE_IDS = {
  test: {
    // These would be populated with actual test mode price IDs from Stripe dashboard
    // For now, we'll use the payment links as fallback
  },
  live: {
    premium_3mo: 'price_1RpphnIw7dQ6dzj5lLIl5Njp',
    premium_6mo: 'price_1RpphnIw7dQ6dzj5WhqVuoPZ',
    premium_year: 'price_1RpphoIw7dQ6dzj5DoOFMeeY',
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Payment system not configured. Please use payment links.' 
      }, { status: 503 })
    }
    
    const { planId } = await request.json()
    
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // Always use live price IDs for now
    const priceId = PRICE_IDS.live[planId as keyof typeof PRICE_IDS.live]
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Get the base URL properly
    const origin = request.headers.get('origin') || 
                   request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   `http://localhost:3000`
    
    // Ensure the origin has a proper scheme
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
    
    // Create checkout session with proper redirect URLs
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/auth/stripe-callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/join?canceled=true`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect customer email
      customer_email: undefined, // Let Stripe collect it
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}