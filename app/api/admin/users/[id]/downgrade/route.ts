import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const userId = params.id
    
    // Get user and active subscription
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions (
          id,
          stripe_subscription_id,
          status
        )
      `)
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Cancel any active Stripe subscriptions
    const activeSubscriptions = user.subscriptions?.filter(
      (sub: any) => sub.status === 'active' && sub.stripe_subscription_id
    ) || []
    
    for (const sub of activeSubscriptions) {
      if (stripe && sub.stripe_subscription_id && !sub.stripe_subscription_id.startsWith('admin_')) {
        try {
          await stripe.subscriptions.cancel(sub.stripe_subscription_id, {
            invoice_now: false,
            prorate: false
          })
        } catch (stripeError) {
          console.error('Error cancelling Stripe subscription:', stripeError)
        }
      }
      
      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancellation_date: new Date().toISOString(),
          cancellation_reason: 'admin_downgrade'
        })
        .eq('id', sub.id)
    }
    
    // Update user to free plan
    const { error: updateError } = await supabase
      .from('users')
      .update({
        plan: 'free',
        plan_renews_at: null
      })
      .eq('id', userId)
    
    if (updateError) {
      throw updateError
    }
    
    // Log the event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'admin_downgrade',
        event_data: {
          previous_plan: user.plan,
          downgraded_by: 'admin',
          canceled_subscriptions: activeSubscriptions.map((sub: any) => sub.id)
        }
      })
    
    return NextResponse.json({
      success: true,
      message: 'User downgraded to free plan',
      canceledSubscriptions: activeSubscriptions.length
    })
  } catch (error) {
    console.error('Error downgrading user:', error)
    return NextResponse.json(
      { error: 'Failed to downgrade user' },
      { status: 500 }
    )
  }
}