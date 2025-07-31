import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripeKey = process.env.NODE_ENV === 'development' 
  ? process.env.STRIPE_SECRET_KEY_TEST 
  : process.env.STRIPE_SECRET_KEY
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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create service role client
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get user's current subscription from database
    const { data: dbSubscriptions } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!dbSubscriptions || dbSubscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscription found in database' }, { status: 404 })
    }

    const results = []

    // Check each subscription in Stripe
    for (const dbSub of dbSubscriptions) {
      try {
        // Try both possible ID fields
        const subId = dbSub.stripe_subscription_id || dbSub.stripe_sub_id
        if (!subId) {
          results.push({
            dbId: dbSub.id,
            status: 'error',
            error: 'No Stripe subscription ID found in database'
          })
          continue
        }
        
        const stripeSub = await stripe.subscriptions.retrieve(subId)
        
        const needsUpdate = stripeSub.cancel_at_period_end !== dbSub.stripe_cancel_at_period_end

        if (needsUpdate) {
          const updateData: any = {
            status: stripeSub.status,
            stripe_cancel_at_period_end: stripeSub.cancel_at_period_end,
            stripe_current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString()
          }

          if (stripeSub.cancel_at_period_end === true) {
            updateData.subscription_end_date = new Date(stripeSub.current_period_end * 1000).toISOString()
            updateData.cancellation_date = new Date().toISOString()
          } else {
            updateData.subscription_end_date = null
            updateData.cancellation_date = null
          }

          const { data: updated, error } = await serviceSupabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', dbSub.id)
            .select()
            .single()

          results.push({
            subscriptionId: dbSub.stripe_subscription_id,
            status: 'updated',
            stripeStatus: {
              cancel_at_period_end: stripeSub.cancel_at_period_end,
              status: stripeSub.status,
              current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString()
            },
            dbUpdate: {
              success: !!updated,
              error: error?.message,
              data: updated
            }
          })
        } else {
          results.push({
            subscriptionId: dbSub.stripe_subscription_id,
            status: 'no_update_needed',
            stripeStatus: {
              cancel_at_period_end: stripeSub.cancel_at_period_end,
              status: stripeSub.status
            },
            dbStatus: {
              cancel_at_period_end: dbSub.stripe_cancel_at_period_end,
              cancellation_date: dbSub.cancellation_date,
              subscription_end_date: dbSub.subscription_end_date
            }
          })
        }
      } catch (error: any) {
        results.push({
          subscriptionId: dbSub.stripe_subscription_id,
          status: 'error',
          error: error.message
        })
      }
    }

    return NextResponse.json({
      message: 'Cancellation status sync completed',
      results
    })

  } catch (error: any) {
    console.error('Error syncing cancellation status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync cancellation status' },
      { status: 500 }
    )
  }
}