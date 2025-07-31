import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // Get all users
    const { data: users } = await serviceSupabase
      .from('users')
      .select('id, email, stripe_customer_id, plan')
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      total_users: users?.length || 0,
      users
    })

  } catch (error: any) {
    console.error('Error listing users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list users' },
      { status: 500 }
    )
  }
}