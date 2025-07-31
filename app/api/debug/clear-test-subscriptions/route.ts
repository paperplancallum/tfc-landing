import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    // Delete all test subscriptions for this user
    const { data: deleted, error } = await serviceSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Test subscriptions cleared',
      deleted_count: deleted?.length || 0,
      deleted_subscriptions: deleted
    })

  } catch (error: any) {
    console.error('Error clearing subscriptions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clear subscriptions' },
      { status: 500 }
    )
  }
}