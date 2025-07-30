import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated', authError }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, is_admin')
      .eq('id', user.id)
      .single()
    
    // Try a simple query
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, plan, is_admin')
      .limit(5)
    
    return NextResponse.json({
      currentUser: {
        authId: user.id,
        authEmail: user.email,
        dbData: userData,
        dbError: userError?.message
      },
      testQuery: {
        users: allUsers,
        error: allUsersError?.message
      },
      isAdmin: userData?.is_admin || false
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}