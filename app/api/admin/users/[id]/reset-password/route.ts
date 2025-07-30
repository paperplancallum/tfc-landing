import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeNewSubscriberEmail from '@/emails/welcome-new-subscriber'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const userId = params.id
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Generate temporary password
    const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}`
    
    // Update user with temporary password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        temp_password: tempPassword,
        password_reset_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .eq('id', userId)
    
    if (updateError) {
      throw updateError
    }
    
    // Send email with temporary password
    if (resend) {
      const passwordSetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/set-password?email=${encodeURIComponent(user.email)}&token=${tempPassword}`
      
      await resend.emails.send({
        from: 'Tom\'s Flight Club <deals@tomsflightclub.com>',
        to: user.email,
        subject: 'Password Reset - Tom\'s Flight Club',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name || 'there'},</p>
            <p>An admin has reset your password. Your temporary password is:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <code style="font-size: 18px; font-weight: bold;">${tempPassword}</code>
            </div>
            <p>Please click the link below to set a new password:</p>
            <a href="${passwordSetUrl}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Set New Password</a>
            <p>This temporary password will expire in 24 hours.</p>
            <p>Best regards,<br>Tom's Flight Club Team</p>
          </div>
        `
      })
    }
    
    // Log the event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'admin_password_reset',
        event_data: {
          reset_by: 'admin',
          email_sent: !!resend
        }
      })
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      tempPassword,
      emailSent: !!resend
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}