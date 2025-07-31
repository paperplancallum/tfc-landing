import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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

    // Get subscriptions
    const { data: subscriptions } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile?.id || '')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      profile,
      subscriptions,
      total_subscriptions: subscriptions?.length || 0
    })

  } catch (error: any) {
    console.error('Error checking user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check user' },
      { status: 500 }
    )
  }
}