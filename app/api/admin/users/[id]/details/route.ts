import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Get user details using direct REST API
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
      }
    )
    
    const users = await userResponse.json()
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null
    
    if (!user) {
      console.error('User not found:', { userId, response: users })
      return NextResponse.json(
        { error: 'User not found', debug: { userId, responseData: users } },
        { status: 404 }
      )
    }
    
    // Get subscriptions
    const subsResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )
    
    const subscriptions = await subsResponse.json()
    
    // Get emails sent (if table exists)
    let emails = []
    try {
      const emailsResponse = await fetch(
        `${supabaseUrl}/rest/v1/emails_sent?user_id=eq.${userId}&select=*&order=sent_at.desc&limit=50`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      )
      emails = await emailsResponse.json()
    } catch (e) {
      // Table might not exist
    }
    
    // Get subscription events (if table exists)
    let events = []
    try {
      const eventsResponse = await fetch(
        `${supabaseUrl}/rest/v1/subscription_events?user_id=eq.${userId}&select=*&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      )
      events = await eventsResponse.json()
    } catch (e) {
      // Table might not exist
    }
    
    // Get win-back campaigns (if table exists)
    let winBackCampaigns = []
    try {
      const winBackResponse = await fetch(
        `${supabaseUrl}/rest/v1/win_back_campaigns?user_id=eq.${userId}&select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      )
      winBackCampaigns = await winBackResponse.json()
    } catch (e) {
      // Table might not exist
    }
    
    return NextResponse.json({
      user,
      subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
      events: Array.isArray(events) ? events : [],
      emails: Array.isArray(emails) ? emails : [],
      winBackCampaigns: Array.isArray(winBackCampaigns) ? winBackCampaigns : [],
      analytics: [] // Empty for now
    })
  } catch (error: any) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details', details: error.message },
      { status: 500 }
    )
  }
}