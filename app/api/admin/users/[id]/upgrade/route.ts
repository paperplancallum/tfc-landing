import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const userId = params.id
    const { duration = '1_year' } = await request.json() // '1_month', '3_months', '1_year'
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate subscription dates
    const now = new Date()
    let endDate = new Date()
    
    switch (duration) {
      case '1_month':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case '3_months':
        endDate.setMonth(endDate.getMonth() + 3)
        break
      case '1_year':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      default:
        endDate.setFullYear(endDate.getFullYear() + 1)
    }
    
    // Update user to premium
    const { error: updateError } = await supabase
      .from('users')
      .update({
        plan: 'premium',
        plan_renews_at: endDate.toISOString()
      })
      .eq('id', userId)
    
    if (updateError) {
      throw updateError
    }
    
    // Create a subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        plan_id: `admin_upgrade_${duration}`,
        plan_name: `Premium (Admin Upgrade - ${duration.replace('_', ' ')})`,
        price_amount: 0,
        price_currency: 'gbp',
        stripe_subscription_id: `admin_${userId}_${Date.now()}`,
        subscription_start_date: now.toISOString(),
        subscription_end_date: endDate.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
      })
    
    if (subError) {
      // Rollback user update
      await supabase
        .from('users')
        .update({ plan: 'free', plan_renews_at: null })
        .eq('id', userId)
      throw subError
    }
    
    // Log the event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'admin_upgrade',
        event_data: {
          duration,
          upgraded_by: 'admin',
          end_date: endDate.toISOString()
        }
      })
    
    return NextResponse.json({
      success: true,
      message: `User upgraded to premium for ${duration.replace('_', ' ')}`,
      subscription: {
        plan: 'premium',
        endDate: endDate.toISOString()
      }
    })
  } catch (error) {
    console.error('Error upgrading user:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade user' },
      { status: 500 }
    )
  }
}