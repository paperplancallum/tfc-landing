import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Search for users by email (partial match)
    // First try with full select including subscriptions
    let { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions (
          id,
          status,
          plan_name,
          price_amount,
          price_currency,
          current_period_end,
          subscription_end_date,
          stripe_subscription_id
        )
      `)
      .ilike('email', `%${email}%`)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // If that fails due to RLS, try without subscriptions
    if (error && error.message.includes('recursion')) {
      console.log('RLS error, trying without subscriptions...')
      const simpleResult = await supabase
        .from('users')
        .select('*')
        .ilike('email', `%${email}%`)
        .order('created_at', { ascending: false })
        .limit(10)
      
      users = simpleResult.data
      error = simpleResult.error
    }
    
    if (error) {
      console.error('Error searching users:', error)
      return NextResponse.json(
        { error: 'Failed to search users', details: error.message },
        { status: 500 }
      )
    }
    
    // If no users, return empty array
    if (!users || users.length === 0) {
      return NextResponse.json({
        users: [],
        total: 0
      })
    }
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const stats: any = {
          subscriptionEvents: 0,
          emailsSent: 0,
          activeWinBackCampaigns: []
        }
        
        // Try to get subscription event count (table might not exist)
        try {
          const { count: eventCount } = await supabase
            .from('subscription_events')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          stats.subscriptionEvents = eventCount || 0
        } catch (e) {
          // Table doesn't exist, ignore
        }
        
        // Get emails sent count
        try {
          const { count: emailCount } = await supabase
            .from('emails_sent')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          stats.emailsSent = emailCount || 0
        } catch (e) {
          // Table doesn't exist, ignore
        }
        
        // Get active win-back campaigns (table might not exist)
        try {
          const { data: winBackCampaigns } = await supabase
            .from('win_back_campaigns')
            .select('campaign_type, discount_percentage, expires_at')
            .eq('user_id', user.id)
            .eq('redeemed', false)
            .gt('expires_at', new Date().toISOString())
          stats.activeWinBackCampaigns = winBackCampaigns || []
        } catch (e) {
          // Table doesn't exist, ignore
        }
        
        return {
          ...user,
          stats
        }
      })
    )
    
    return NextResponse.json({
      users: usersWithStats,
      total: users.length
    })
  } catch (error) {
    console.error('Error in user search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}