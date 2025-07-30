import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    
    // Create a service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )
    
    // Simple search without joins
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('email', `%${email}%`)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Error searching users:', error)
      return NextResponse.json(
        { error: 'Failed to search users', details: error.message },
        { status: 500 }
      )
    }
    
    // Get subscription counts for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        // Get active subscription if any
        const { data: subscriptions } = await supabaseAdmin
          .from('subscriptions')
          .select('status, plan_name')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)
        
        return {
          ...user,
          subscriptions: subscriptions || [],
          stats: {
            subscriptionEvents: 0,
            emailsSent: 0,
            activeWinBackCampaigns: []
          }
        }
      })
    )
    
    return NextResponse.json({
      users: usersWithStats,
      total: users?.length || 0
    })
  } catch (error: any) {
    console.error('Error in user search:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}