import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get user profile
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get subscriptions
    const { data: subscriptions } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      auth_user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile,
      subscriptions
    })

  } catch (error: any) {
    console.error('Error getting user info:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get user info' },
      { status: 500 }
    )
  }
}