import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: 'Not authenticated',
        authError: authError?.message
      })
    }
    
    // Get user from database without RLS
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      authenticated: true,
      authUser: {
        id: user.id,
        email: user.email,
      },
      dbUser: userData,
      isAdmin: userData?.is_admin || false,
      error: userError?.message
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Check failed',
      details: error.message
    }, { status: 500 })
  }
}