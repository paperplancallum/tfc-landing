import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export async function POST(request: NextRequest) {
  try {
    const { reason, feedback, otherReason } = await request.json()
    
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user's active subscription
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
    
    // Cancel the subscription in Stripe
    if (stripe && subscription.stripe_subscription_id) {
      try {
        // Cancel at period end (user keeps access until end of billing period)
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: reason,
            cancellation_feedback: feedback || '',
            cancellation_other_reason: otherReason || '',
            cancelled_at: new Date().toISOString(),
          },
        })
        
        // Update local subscription record
        await supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            cancellation_reason: reason,
            cancellation_feedback: {
              reason,
              feedback,
              otherReason,
              cancelledAt: new Date().toISOString(),
            },
          })
          .eq('id', subscription.id)
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError)
        return NextResponse.json(
          { error: 'Failed to cancel subscription' },
          { status: 500 }
        )
      }
    }
    
    // Log cancellation event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: user.id,
        event_type: 'subscription_cancelled',
        event_data: {
          subscription_id: subscription.id,
          reason,
          feedback,
          otherReason,
          cancel_at_period_end: true,
          current_period_end: subscription.current_period_end,
        },
      })
    
    // Send cancellation confirmation email
    const { data: dbUser } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user.id)
      .single()
    
    if (dbUser) {
      // Note: You could add email sending here using Resend
      // to confirm the cancellation and remind them of the end date
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      accessUntil: subscription.current_period_end,
      feedback: {
        reason,
        feedback,
        otherReason,
      },
    })
  } catch (error) {
    console.error('Error processing cancellation:', error)
    return NextResponse.json(
      { error: 'Failed to process cancellation' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch cancellation reasons for the UI
export async function GET(request: NextRequest) {
  const reasons = [
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_enough_deals', label: 'Not enough relevant deals' },
    { value: 'found_better_service', label: 'Found a better service' },
    { value: 'not_traveling', label: 'Not traveling anymore' },
    { value: 'technical_issues', label: 'Technical issues' },
    { value: 'poor_customer_service', label: 'Poor customer service' },
    { value: 'other', label: 'Other reason' },
  ]
  
  return NextResponse.json({ reasons })
}