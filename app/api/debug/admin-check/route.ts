import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        authError: authError?.message
      }, { status: 401 })
    }
    
    // Try to get user from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Also try to find by email
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email!)
      .single()
    
    // Check if callum@paperplan.co exists
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'callum@paperplan.co')
      .single()
    
    return NextResponse.json({
      authUser: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      userTableData: userData || null,
      userTableError: userError?.message || null,
      userByEmail: userByEmail || null,
      userByEmailError: emailError?.message || null,
      adminUserExists: adminUser || null,
      adminUserError: adminError?.message || null,
      debug: {
        authUserId: user.id,
        authUserEmail: user.email,
        userDataFound: !!userData,
        isAdminField: userData?.is_admin,
        userByEmailFound: !!userByEmail,
        userByEmailIsAdmin: userByEmail?.is_admin
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'Debug check failed',
      details: error
    }, { status: 500 })
  }
}