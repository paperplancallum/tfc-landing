import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, subscriptionId } = body
    
    if (!email || !subscriptionId) {
      return NextResponse.json({ error: 'Email and subscriptionId are required' }, { status: 400 })
    }

    // Create service role client
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get user profile
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: `User not found with email: ${email}` }, { status: 404 })
    }

    // Delete any existing subscriptions for this user
    await serviceSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', profile.id)

    // Create new subscription record
    const { data: subRecord, error: subError } = await serviceSupabase
      .from('subscriptions')
      .insert({
        user_id: profile.id,
        stripe_sub_id: subscriptionId,
        status: 'trialing',
        current_period_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        plan: 'premium_3mo'
      })
      .select()
      .single()

    if (subError) {
      return NextResponse.json({ 
        error: 'Failed to create subscription record',
        details: subError 
      }, { status: 500 })
    }

    // Update user plan
    const { data: updatedUser, error: updateError } = await serviceSupabase
      .from('users')
      .update({ 
        plan: 'premium'
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update user plan',
        details: updateError 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Subscription synced successfully',
      user: updatedUser,
      subscription: subRecord
    })

  } catch (error: any) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}