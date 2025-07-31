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

    // Get all subscriptions for this user
    const { data: subscriptions } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Get user profile
    const { data: profile } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      profile: {
        plan: profile?.plan,
        stripe_customer_id: profile?.stripe_customer_id,
        stripe_email: profile?.stripe_email
      },
      subscriptions,
      subscription_count: subscriptions?.length || 0,
      active_subscriptions: subscriptions?.filter(s => s.status === 'active' || s.status === 'trialing') || []
    })

  } catch (error: any) {
    console.error('Error checking subscriptions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check subscriptions' },
      { status: 500 }
    )
  }
}