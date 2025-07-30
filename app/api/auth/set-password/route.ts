import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, tempPassword, newPassword } = await request.json()
    
    if (!email || !tempPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, temporary password, and new password are required' },
        { status: 400 }
      )
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Verify the temporary password
    const { data: user } = await supabase
      .from('users')
      .select('id, temp_password, password_reset_expires')
      .eq('email', email)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check if temporary password matches
    if (user.temp_password !== tempPassword) {
      return NextResponse.json(
        { error: 'Invalid temporary password' },
        { status: 401 }
      )
    }
    
    // Check if temporary password has expired
    if (user.password_reset_expires && new Date(user.password_reset_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Temporary password has expired. Please request a new one.' },
        { status: 401 }
      )
    }
    
    // Create the user in Supabase Auth if they don't exist
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: newPassword,
      options: {
        data: {
          user_id: user.id,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?redirectTo=/deals`,
      }
    })
    
    if (signUpError) {
      // If user already exists in auth, try to update their password
      if (signUpError.message.includes('already registered')) {
        // For security, we can't directly update password without current password
        // User should use password reset flow instead
        return NextResponse.json(
          { error: 'Account already exists. Please use the password reset option.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }
    
    // Clear the temporary password
    await supabase
      .from('users')
      .update({
        temp_password: null,
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq('id', user.id)
    
    // Log the password set event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: user.id,
        event_type: 'password_set',
        event_data: { method: 'temp_password' }
      })
    
    // Sign the user in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: newPassword,
    })
    
    if (signInError) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Password set successfully. Please log in with your new password.',
          requiresLogin: true 
        },
        { status: 200 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password set successfully',
      user: signInData.user,
      session: signInData.session,
    })
  } catch (error) {
    console.error('Error setting password:', error)
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    )
  }
}