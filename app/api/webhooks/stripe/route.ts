import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeNewSubscriberEmail from '@/emails/welcome-new-subscriber'
import SubscriptionExpiredEmail from '@/emails/subscription-expired'

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  // Return early if Stripe is not configured
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }
  
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
            // Generate temporary password
            const { data: tempPasswordResult } = await supabase
              .rpc('generate_temp_password')
              .single()
            
            const tempPassword = tempPasswordResult || `TempPass${Math.random().toString(36).slice(-8)}`
            
            // Create user profile with temporary password
            const { data: newUser } = await supabase.from('users').insert({
              email: session.customer_email,
              stripe_customer_id: session.customer as string,
              stripe_email: session.customer_email,
              plan: 'premium',
              temp_password: tempPassword,
              password_reset_expires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
              account_created_via: 'stripe',
            }).select().single()
            
            // Send welcome email with temporary password
            if (resend && newUser) {
              const passwordResetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/set-password?token=${tempPassword}&email=${encodeURIComponent(session.customer_email)}`
              
              await resend.emails.send({
                from: 'Tom\'s Flight Club <welcome@tomsflightclub.com>',
                to: session.customer_email,
                subject: 'Welcome to Tom\'s Flight Club Premium! 🎉',
                html: await render(WelcomeNewSubscriberEmail({
                  email: session.customer_email,
                  tempPassword,
                  planName: getPlanDisplayName(session.metadata?.plan_id || 'premium'),
                  passwordResetUrl,
                })),
              })
            }
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
          .update({ 
            status: 'canceled',
            subscription_end_date: new Date().toISOString(),
            cancellation_date: new Date().toISOString()
          })
          .eq('stripe_subscription_id', deletedSub.id)
        
        // Get user details
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', deletedSub.id)
          .single()
          
        if (sub) {
          // Update user plan to free
          const { data: user } = await supabase
            .from('users')
            .update({ plan: 'free' })
            .eq('id', sub.user_id)
            .select()
            .single()
          
          // Send subscription expired email
          if (resend && user && user.email) {
            await resend.emails.send({
              from: 'Tom\'s Flight Club <noreply@tomsflightclub.com>',
              to: user.email,
              subject: 'Your Premium Membership Has Expired',
              html: await render(SubscriptionExpiredEmail({
                userName: user.name || 'there',
                expirationDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                lastPlanName: getPlanDisplayName(deletedSub.metadata?.plan_id || 'premium'),
                reactivateUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/join`,
              })),
            })
            
            // Track event
            await supabase.from('subscription_events').insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              event_type: 'expired_email_sent',
              event_data: { email_type: 'subscription_expired' }
            })
          }
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

function getPlanDisplayName(planId: string): string {
  const plans: Record<string, string> = {
    'premium_3mo': 'Premium 3 Months',
    'premium_6mo': 'Premium 6 Months',
    'premium_year': 'Premium Yearly',
    'premium': 'Premium'
  }
  return plans[planId] || 'Premium'
}