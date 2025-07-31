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

    // Delete any existing subscription records for this user
    await serviceSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)
    
    // Create a mock subscription record that shows as cancelled
    const mockSubscriptionId = `sub_mock_${Date.now()}`
    const currentPeriodEnd = new Date()
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30) // 30 days from now
    
    const { data: newSub, error } = await serviceSupabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        stripe_sub_id: mockSubscriptionId,
        status: 'active',
        current_period_end: currentPeriodEnd.toISOString(),
        // Try adding the stripe-specific fields if they exist
        stripe_subscription_id: mockSubscriptionId,
        stripe_current_period_end: currentPeriodEnd.toISOString(),
        stripe_cancel_at_period_end: true, // This is the key field for showing cancellation
        plan: 'premium_3mo'
      })
      .select()
      .single()

    if (error) {
      // Try with minimal required fields based on original schema
      const { data: minimalSub, error: minimalError } = await serviceSupabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_sub_id: mockSubscriptionId,
          status: 'active',
          current_period_end: currentPeriodEnd.toISOString(),
          plan: 'premium_3mo'
        })
        .select()
        .single()
      
      if (minimalError) {
        return NextResponse.json({ 
          error: 'Failed to create mock subscription',
          details: minimalError.message,
          hint: 'Check if subscriptions table exists and what columns it has'
        }, { status: 500 })
      }
      
      // If minimal fields worked, try to update with cancellation status
      const { data: updated } = await serviceSupabase
        .from('subscriptions')
        .update({
          stripe_cancel_at_period_end: true,
          stripe_current_period_end: currentPeriodEnd.toISOString()
        })
        .eq('id', minimalSub.id)
        .select()
        .single()
      
      return NextResponse.json({
        message: 'Mock subscription created (minimal fields, then updated)',
        subscription: updated || minimalSub,
        note: 'This is a mock subscription for testing the cancellation UI'
      })
    }

    return NextResponse.json({
      message: 'Mock subscription created successfully',
      subscription: newSub,
      note: 'This is a mock subscription showing as cancelled, ending on ' + currentPeriodEnd.toLocaleDateString()
    })

  } catch (error: any) {
    console.error('Error creating mock subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create mock subscription' },
      { status: 500 }
    )
  }
}