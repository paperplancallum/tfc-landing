import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get all subscriptions for the user
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    // Get subscription events
    const { data: events } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    // Get win-back campaigns
    const { data: campaigns } = await supabase
      .from('win_back_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    // Format the history
    const history = {
      subscriptions: subscriptions?.map(sub => ({
        id: sub.id,
        status: sub.status,
        planName: sub.plan_name,
        priceAmount: sub.price_amount,
        priceCurrency: sub.price_currency,
        startDate: sub.subscription_start_date,
        endDate: sub.subscription_end_date,
        cancelledAt: sub.cancelled_at,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        cancellationReason: sub.cancellation_reason,
      })) || [],
      events: events?.map(event => ({
        id: event.id,
        type: event.event_type,
        data: event.event_data,
        createdAt: event.created_at,
      })) || [],
      winBackCampaigns: campaigns?.map(campaign => ({
        id: campaign.id,
        type: campaign.campaign_type,
        discountPercentage: campaign.discount_percentage,
        promoCode: campaign.stripe_promo_code,
        sentAt: campaign.sent_at,
        redeemed: campaign.redeemed,
        redeemedAt: campaign.redeemed_at,
        expiresAt: campaign.expires_at,
      })) || [],
    }
    
    // Calculate subscription stats
    const stats = {
      totalMonthsSubscribed: 0,
      totalSpent: 0,
      firstSubscriptionDate: null as string | null,
      lastActiveDate: null as string | null,
    }
    
    if (subscriptions && subscriptions.length > 0) {
      // Calculate total months subscribed
      subscriptions.forEach(sub => {
        if (sub.subscription_start_date && sub.subscription_end_date) {
          const start = new Date(sub.subscription_start_date)
          const end = new Date(sub.subscription_end_date)
          const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
          stats.totalMonthsSubscribed += months
        }
      })
      
      // Calculate total spent (approximate based on subscription periods)
      subscriptions.forEach(sub => {
        if (sub.price_amount && sub.subscription_start_date) {
          const start = new Date(sub.subscription_start_date)
          const end = sub.subscription_end_date ? new Date(sub.subscription_end_date) : new Date()
          const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
          stats.totalSpent += (sub.price_amount * months)
        }
      })
      
      // Find first and last dates
      const sortedByStart = subscriptions
        .filter(sub => sub.subscription_start_date)
        .sort((a, b) => new Date(a.subscription_start_date!).getTime() - new Date(b.subscription_start_date!).getTime())
      
      if (sortedByStart.length > 0) {
        stats.firstSubscriptionDate = sortedByStart[0].subscription_start_date
      }
      
      const activeOrRecent = subscriptions
        .filter(sub => sub.status === 'active' || sub.subscription_end_date)
        .sort((a, b) => {
          const dateA = a.status === 'active' ? new Date() : new Date(a.subscription_end_date!)
          const dateB = b.status === 'active' ? new Date() : new Date(b.subscription_end_date!)
          return dateB.getTime() - dateA.getTime()
        })
      
      if (activeOrRecent.length > 0) {
        stats.lastActiveDate = activeOrRecent[0].status === 'active' 
          ? new Date().toISOString() 
          : activeOrRecent[0].subscription_end_date
      }
    }
    
    return NextResponse.json({
      history,
      stats,
    })
  } catch (error) {
    console.error('Error fetching subscription history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription history' },
      { status: 500 }
    )
  }
}