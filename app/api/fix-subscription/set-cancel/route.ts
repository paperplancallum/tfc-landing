import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get the most recent subscription
    const { data: subscription } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Update subscription to show as cancelling
    // First, let's see what columns exist by updating known fields
    const { data: updated, error } = await serviceSupabase
      .from('subscriptions')
      .update({
        status: 'active', // Keep as active but...
        cancellation_date: new Date().toISOString(), // Mark when cancelled
        subscription_end_date: subscription.current_period_end // When it will actually end
      })
      .eq('id', subscription.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update subscription',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Subscription set to cancel at period end',
      subscription: updated,
      cancellation_details: {
        will_cancel_at: subscription.current_period_end,
        cancelled_on: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error setting subscription cancellation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set cancellation' },
      { status: 500 }
    )
  }
}