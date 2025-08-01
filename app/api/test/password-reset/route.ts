import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Always use production URL for password reset
    const baseUrl = 'https://www.tomsflightclub.com'
    
    console.log('Testing password reset for:', email)
    console.log('Base URL:', baseUrl)
    console.log('Redirect URL:', `${baseUrl}/auth/callback?type=recovery`)
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?type=recovery`,
    })
    
    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 400 })
    }
    
    console.log('Password reset success:', data)
    
    return NextResponse.json({ 
      success: true,
      message: 'Password reset email sent',
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}