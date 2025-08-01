import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token, email, newPassword } = await request.json()
    
    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const serviceClient = createServiceClient()
    
    // Validate the token again
    const { data: user, error: userError } = await serviceClient
      .from('users')
      .select('id, password_reset_token, password_reset_expires')
      .eq('email', email)
      .eq('password_reset_token', token)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid reset link' }, { status: 400 })
    }
    
    // Check if token has expired
    if (!user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 })
    }
    
    // Update the user's password using the service role
    const { error: updateError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )
    
    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
    
    // Clear the reset token
    await serviceClient
      .from('users')
      .update({
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq('id', user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}