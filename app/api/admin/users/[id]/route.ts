import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const userId = params.id
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        home_city:home_city_id (
          name,
          iata_code
        )
      `)
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get all subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    // Get subscription events
    const { data: events } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    // Get emails sent
    const { data: emails } = await supabase
      .from('emails_sent')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(50)
    
    // Get win-back campaigns
    const { data: winBackCampaigns } = await supabase
      .from('win_back_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    // Get analytics events
    const { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    
    return NextResponse.json({
      user,
      subscriptions: subscriptions || [],
      events: events || [],
      emails: emails || [],
      winBackCampaigns: winBackCampaigns || [],
      analytics: analytics || []
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}