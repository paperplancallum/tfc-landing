import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Use service role client if available to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabase = createServiceClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
    
    // Get total users
    const { count: totalUsers, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (totalError) {
      console.error('Error getting total users:', totalError)
    }
    
    // Get users by plan
    const { data: usersByPlan, error: planError } = await supabase
      .from('users')
      .select('plan')
    
    if (planError) {
      console.error('Error getting users by plan:', planError)
    }
    
    const planCounts = usersByPlan?.reduce((acc: any, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1
      return acc
    }, { free: 0, premium: 0 }) || { free: 0, premium: 0 }
    
    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Get revenue stats (approximate)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('price_amount, price_currency, status')
      .eq('status', 'active')
    
    const monthlyRevenue = subscriptions?.reduce((total, sub) => {
      return total + (sub.price_amount || 0)
    }, 0) || 0
    
    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: recentSignups } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    // Get email stats (last 30 days)
    const { count: emailsSent } = await supabase
      .from('emails_sent')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', thirtyDaysAgo.toISOString())
    
    // Get win-back campaign stats
    const { data: winBackStats } = await supabase
      .from('win_back_campaigns')
      .select('campaign_type, redeemed')
    
    const winBackSummary = winBackStats?.reduce((acc: any, campaign) => {
      if (!acc[campaign.campaign_type]) {
        acc[campaign.campaign_type] = { sent: 0, redeemed: 0 }
      }
      acc[campaign.campaign_type].sent++
      if (campaign.redeemed) {
        acc[campaign.campaign_type].redeemed++
      }
      return acc
    }, {}) || {}
    
    // Get churn stats (last 30 days)
    const { count: canceledSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('cancellation_date', thirtyDaysAgo.toISOString())
    
    // Get subscription events summary
    const { data: recentEvents } = await supabase
      .from('subscription_events')
      .select('event_type')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const eventSummary = recentEvents?.reduce((acc: any, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {}) || {}
    
    // Debug info
    const debug = {
      totalUsersError: totalError?.message,
      planError: planError?.message,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      userCount: totalUsers,
      usersByPlanCount: usersByPlan?.length
    }

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers || 0,
        freeUsers: planCounts.free,
        premiumUsers: planCounts.premium,
        activeSubscriptions: activeSubscriptions || 0,
        monthlyRevenue: monthlyRevenue / 100, // Convert from pence to pounds
        currency: 'GBP'
      },
      last30Days: {
        newSignups: recentSignups || 0,
        canceledSubscriptions: canceledSubscriptions || 0,
        emailsSent: emailsSent || 0,
        churnRate: activeSubscriptions ? ((canceledSubscriptions || 0) / activeSubscriptions * 100).toFixed(2) + '%' : '0%'
      },
      winBackCampaigns: winBackSummary,
      recentEvents: eventSummary,
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? debug : undefined
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}