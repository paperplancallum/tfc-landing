import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()
    
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Log the incoming request for debugging
    console.log('Confirmation request:', { email, token: token.substring(0, 10) + '...' })
    
    // First check if user exists with this email
    const { data: userByEmail } = await supabase
      .from('users')
      .select('id, email_confirmation_token, email_confirmation_expires')
      .eq('email', email)
      .single()
    
    if (userByEmail) {
      console.log('User found by email, token match:', userByEmail.email_confirmation_token === token)
      console.log('Token in DB:', userByEmail.email_confirmation_token?.substring(0, 10) + '...')
    }
    
    // Find user with matching token and email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email_confirmation_expires')
      .eq('email', email)
      .eq('email_confirmation_token', token)
      .single()
    
    if (userError || !user) {
      console.error('User lookup error:', userError)
      console.error('Failed to find user with email:', email, 'and token:', token.substring(0, 10) + '...')
      return NextResponse.json(
        { error: 'Invalid or expired confirmation link' },
        { status: 400 }
      )
    }
    
    // Check if token has expired
    if (user.email_confirmation_expires) {
      const expiryDate = new Date(user.email_confirmation_expires)
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: 'Confirmation link has expired' },
          { status: 400 }
        )
      }
    }
    
    // Update user to mark email as confirmed
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_confirmed_at: new Date().toISOString(),
        email_confirmation_token: null,
        email_confirmation_expires: null,
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to confirm email' },
        { status: 500 }
      )
    }
    
    // Get the user's email for auto-login
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()
    
    // Return success - user will log in manually
    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully',
      email: userData?.email,
    })
  } catch (error) {
    console.error('Error in confirm-email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}