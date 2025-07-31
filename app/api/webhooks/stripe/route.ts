import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeNewSubscriberEmail from '@/emails/welcome-new-subscriber'
import SubscriptionExpiredEmail from '@/emails/subscription-expired'
import { getPlanFromSubscription } from '@/lib/stripe-helpers'

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  let event: Stripe.Event
  
  // Parse the event to check if it's test mode
  const parsedBody = JSON.parse(body)
  const isTestMode = parsedBody.livemode === false
  
  console.log('Webhook received:', {
    type: parsedBody.type,
    isTestMode,
    hasSignature: !!signature
  })
  
  // Select the appropriate webhook secret
  const webhookSecret = isTestMode 
    ? process.env.STRIPE_WEBHOOK_SECRET 
    : process.env.STRIPE_WEBHOOK_SECRET_LIVE
  
  if (!stripe || !webhookSecret) {
    console.error('Webhook not configured:', { hasStripe: !!stripe, hasSecret: !!webhookSecret })
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service role client for webhook operations (bypasses RLS)
  const supabase = createServiceClient()
  console.log('🔐 Using service role client for webhook operations')

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Processing checkout.session.completed:', {
          email: session.customer_email,
          customerId: session.customer,
          mode: session.mode,
          paymentStatus: session.payment_status
        })
        
        if (session.customer_email && session.customer) {
          // Create or update user
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.customer_email)
            .single()

          console.log('Existing user check:', { found: !!existingUser, userId: existingUser?.id })

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
            const { error: updateError } = await supabase
              .from('users')
              .update({
                stripe_customer_id: session.customer as string,
                stripe_email: session.customer_email,
                plan: 'premium',
              })
              .eq('email', session.customer_email)
            
            console.log('User update result:', { 
              email: session.customer_email,
              updateError: updateError?.message || 'Success'
            })
          }

          // Create subscription record
          if (session.subscription) {
            // Fetch the full subscription object to get plan details
            const fullSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const plan = getPlanFromSubscription(fullSubscription)
            
            const { data: insertedSub, error: insertError } = await supabase.from('subscriptions').insert({
              user_id: existingUser?.id || session.customer as string,
              stripe_sub_id: session.subscription as string,
              stripe_subscription_id: session.subscription as string,
              status: fullSubscription.status,
              current_period_end: new Date(fullSubscription.current_period_end * 1000).toISOString(),
              stripe_current_period_end: new Date(fullSubscription.current_period_end * 1000).toISOString(),
              stripe_cancel_at_period_end: fullSubscription.cancel_at_period_end || false,
              plan,
              // Include trial info if present
              trial_end: fullSubscription.trial_end ? new Date(fullSubscription.trial_end * 1000).toISOString() : null
            }).select()
            
            if (insertError) {
              console.error('❌ Failed to create subscription:', insertError)
            } else {
              console.log('✅ Created subscription successfully:', insertedSub)
            }
            
            console.log('Created subscription in checkout.session.completed:', {
              subscriptionId: session.subscription,
              plan,
              status: fullSubscription.status
            })
          }
        }
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('=== SUBSCRIPTION UPDATE WEBHOOK ===', {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          customerId: subscription.customer,
          timestamp: new Date().toISOString()
        })
        
        // Detect plan type using helper function
        const newPlan = getPlanFromSubscription(subscription)
        
        // Prepare update data
        const updateData: any = {
          status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: subscription.cancel_at_period_end,
          plan: newPlan,
        }
        
        // If subscription is reactivated (cancel_at_period_end changed from true to false)
        // clear the cancellation fields
        if (subscription.cancel_at_period_end === false) {
          updateData.cancellation_date = null
          updateData.subscription_end_date = null
          console.log('✅ Subscription REACTIVATED - clearing cancellation fields')
        } else if (subscription.cancel_at_period_end === true) {
          // If subscription is set to cancel, update the end date
          updateData.subscription_end_date = new Date(subscription.current_period_end * 1000).toISOString()
          updateData.cancellation_date = new Date().toISOString()
          console.log('⚠️ Subscription set to CANCEL at period end:', {
            subscription_end_date: updateData.subscription_end_date,
            cancellation_date: updateData.cancellation_date
          })
        }
        
        // First check if subscription exists
        const { data: existingSub, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        
        console.log('🔍 Existing subscription lookup:', {
          found: !!existingSub,
          error: findError?.message,
          subscription: existingSub
        })
        
        if (!existingSub) {
          console.error('❌ No subscription found with ID:', subscription.id)
          // Try to find by stripe_sub_id as well
          const { data: altSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_sub_id', subscription.id)
            .single()
          
          if (altSub) {
            console.log('✅ Found subscription by stripe_sub_id')
            // Process this subscription instead
            const needsAltUpdate = 
              altSub.status !== updateData.status ||
              altSub.stripe_cancel_at_period_end !== updateData.stripe_cancel_at_period_end ||
              altSub.plan !== updateData.plan ||
              altSub.cancellation_date !== updateData.cancellation_date ||
              altSub.subscription_end_date !== updateData.subscription_end_date
            
            if (needsAltUpdate) {
              const { data: updatedAlt, error: updateAltError } = await supabase
                .from('subscriptions')
                .update(updateData)
                .eq('id', altSub.id)
                .select()
              
              console.log('Update result (alt):', {
                success: !!updatedAlt,
                error: updateAltError?.message
              })
            } else {
              console.log('⏭️ No changes needed for alt subscription')
            }
          } else {
            console.error('❌ No subscription found by either ID')
          }
          break
        }
        
        // Check if update is actually needed
        const needsUpdate = 
          existingSub.status !== updateData.status ||
          existingSub.stripe_cancel_at_period_end !== updateData.stripe_cancel_at_period_end ||
          existingSub.plan !== updateData.plan ||
          existingSub.cancellation_date !== updateData.cancellation_date ||
          existingSub.subscription_end_date !== updateData.subscription_end_date
        
        if (!needsUpdate) {
          console.log('⏭️ No changes needed, skipping update')
          break
        }
        
        console.log('📝 Updating subscription in DB:', {
          id: existingSub.id,
          stripe_subscription_id: subscription.id,
          changes: {
            status: existingSub.status !== updateData.status ? `${existingSub.status} → ${updateData.status}` : 'unchanged',
            cancel_at_period_end: existingSub.stripe_cancel_at_period_end !== updateData.stripe_cancel_at_period_end ? `${existingSub.stripe_cancel_at_period_end} → ${updateData.stripe_cancel_at_period_end}` : 'unchanged',
            plan: existingSub.plan !== updateData.plan ? `${existingSub.plan} → ${updateData.plan}` : 'unchanged'
          }
        })
        
        const { data: updatedSub, error: updateSubError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', existingSub.id)
          .select()
        
        console.log('📊 Subscription update result:', {
          success: !!updatedSub && !updateSubError,
          error: updateSubError?.message,
          rowsUpdated: updatedSub?.length || 0,
          updatedData: updatedSub?.[0]
        })
        
        // Also update the user's plan if it changed
        if (updatedSub && updatedSub.length > 0) {
          const subRecord = updatedSub[0]
          if (subRecord.user_id) {
            await supabase
              .from('users')
              .update({ plan: newPlan })
              .eq('id', subRecord.user_id)
            
            console.log('Updated user plan to:', newPlan)
          }
        }
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

      case 'invoice.payment.paid':
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Processing invoice.payment.paid:', {
          customerEmail: invoice.customer_email,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          subscription: invoice.subscription
        })
        
        if (invoice.customer_email) {
          // Update existing user to premium
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, plan')
            .eq('email', invoice.customer_email)
            .single()
          
          if (existingUser) {
            if (existingUser.plan !== 'premium') {
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  stripe_customer_id: invoice.customer as string,
                  plan: 'premium',
                })
                .eq('email', invoice.customer_email)
              
              console.log('User upgraded via invoice payment:', {
                email: invoice.customer_email,
                updateError: updateError?.message || 'Success'
              })
            }
            
            // Create or update subscription record if this is a subscription invoice
            if (invoice.subscription && typeof invoice.subscription === 'string') {
              const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('stripe_subscription_id', invoice.subscription)
                .single()
              
              if (!existingSub) {
                // Create subscription record
                const { error: insertError } = await supabase
                  .from('subscriptions')
                  .insert({
                    user_id: existingUser.id,
                    stripe_subscription_id: invoice.subscription,
                    status: 'active',
                    stripe_current_period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : new Date().toISOString(),
                  })
                
                console.log('Created subscription record:', {
                  subscriptionId: invoice.subscription,
                  error: insertError?.message || 'Success'
                })
              }
            }
          }
        }
        break
      
      case 'customer.subscription.created':
        const newSubscription = event.data.object as Stripe.Subscription
        
        console.log('Processing subscription created:', {
          subscriptionId: newSubscription.id,
          customer: newSubscription.customer,
          status: newSubscription.status
        })
        
        // Get user by customer ID or email
        let user = null
        if (typeof newSubscription.customer === 'string') {
          const { data } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', newSubscription.customer)
            .single()
          user = data
        }
        
        if (user) {
          // Detect plan type
          const plan = getPlanFromSubscription(newSubscription)
          
          // Create subscription record
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              stripe_subscription_id: newSubscription.id,
              status: newSubscription.status,
              stripe_current_period_end: new Date(newSubscription.current_period_end * 1000).toISOString(),
              stripe_cancel_at_period_end: newSubscription.cancel_at_period_end || false,
              plan,
            })
          
          // Update user plan to premium
          await supabase
            .from('users')
            .update({ plan: 'premium' })
            .eq('id', user.id)
          
          console.log('Created subscription from subscription.created:', {
            subscriptionId: newSubscription.id,
            error: insertError?.message || 'Success'
          })
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