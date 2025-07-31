import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's stripe customer ID
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    console.log('User profile:', { 
      email: profile?.email,
      stripe_customer_id: profile?.stripe_customer_id 
    })

    if (!profile?.stripe_customer_id) {
      // Try to find customer by email in Stripe
      if (profile?.email) {
        const customers = await stripe.customers.list({
          email: profile.email,
          limit: 1
        })
        
        if (customers.data.length > 0) {
          const customer = customers.data[0]
          console.log('Found customer in Stripe:', customer.id)
          
          // Update user with customer ID
          await supabase
            .from('users')
            .update({ stripe_customer_id: customer.id })
            .eq('id', user.id)
          
          // Create portal session with found customer
          const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${request.headers.get('origin')}/account`,
          })

          return NextResponse.json({ url: session.url })
        }
      }
      
      return NextResponse.json({ error: 'No Stripe customer found. Please contact support.' }, { status: 400 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}