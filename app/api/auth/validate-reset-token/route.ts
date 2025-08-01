import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()
    
    if (!token || !email) {
      return NextResponse.json({ valid: false, error: 'Missing token or email' }, { status: 400 })
    }
    
    const supabase = createServiceClient()
    
    // Check if the token is valid
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_reset_token, password_reset_expires')
      .eq('email', email)
      .eq('password_reset_token', token)
      .single()
    
    if (error || !user) {
      return NextResponse.json({ valid: false, error: 'Invalid reset link' }, { status: 400 })
    }
    
    // Check if token has expired
    if (!user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Reset link has expired' }, { status: 400 })
    }
    
    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}