import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.customer_email && session.customer) {
          // Create or update user
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.customer_email)
            .single()

          if (!existingUser) {
            // Create user profile (they'll create auth account later)
            await supabase.from('users').insert({
              email: session.customer_email,
              stripe_customer_id: session.customer as string,
              stripe_email: session.customer_email,
              plan: 'premium',
            })
          } else {
            // Update existing user
            await supabase
              .from('users')
              .update({
                stripe_customer_id: session.customer as string,
                stripe_email: session.customer_email,
                plan: 'premium',
              })
              .eq('email', session.customer_email)
          }

          // Create subscription record
          if (session.subscription) {
            await supabase.from('subscriptions').insert({
              user_id: existingUser?.id || session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: 'active',
              current_period_end: new Date().toISOString(), // Would get from Stripe subscription object
            })
          }
        }
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id)
        break

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', deletedSub.id)
        
        // Update user plan to free
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', deletedSub.id)
          .single()
          
        if (sub) {
          await supabase
            .from('users')
            .update({ plan: 'free' })
            .eq('id', sub.user_id)
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}