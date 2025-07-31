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

    // Clear cancellation fields to reactivate
    const { data: updated, error } = await serviceSupabase
      .from('subscriptions')
      .update({
        cancellation_date: null,
        subscription_end_date: null,
        // Also ensure status is active
        status: 'active'
      })
      .eq('id', subscription.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to reactivate subscription',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Subscription reactivated successfully',
      subscription: updated,
      reactivation_details: {
        was_cancelled_on: subscription.cancellation_date,
        was_set_to_end_on: subscription.subscription_end_date,
        current_period_end: updated.current_period_end
      }
    })

  } catch (error: any) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}