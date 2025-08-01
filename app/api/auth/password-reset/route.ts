import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'
import { render } from '@react-email/render'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// Debug logging
console.log('Password reset API - Resend configured:', !!resend)
console.log('Password reset API - Using production domain')

// Simple email template for password reset
const PasswordResetEmail = ({ resetUrl }: { resetUrl: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Reset Your Password</h2>
  <p>You requested a password reset for your Tom's Flight Club account.</p>
  <p>Click the button below to reset your password:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request this password reset, please ignore this email.</p>
  <p style="margin-top: 30px; color: #666;">Best regards,<br>Tom's Flight Club Team</p>
</body>
</html>
`

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    
    const supabase = createServiceClient()
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (userError || !user) {
      // Don't reveal if user exists or not
      return NextResponse.json({ success: true })
    }
    
    // Generate a secure token
    const randomValues = new Uint8Array(32)
    crypto.getRandomValues(randomValues)
    const token = Array.from(randomValues, byte => byte.toString(16).padStart(2, '0')).join('')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // 1 hour expiry
    
    // Store the token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: token,
        password_reset_expires: expires.toISOString(),
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Error storing reset token:', updateError)
      return NextResponse.json({ error: 'Failed to generate reset token' }, { status: 500 })
    }
    
    // Create reset URL - direct link to our domain with token
    const resetUrl = `https://www.tomsflightclub.com/?token=${token}&email=${encodeURIComponent(email)}`
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Tom\'s Flight Club <noreply@tomsflightclub.com>',
      to: email,
      subject: 'Reset Your Password - Tom\'s Flight Club',
      html: PasswordResetEmail({ resetUrl }),
    })
    
    if (error) {
      console.error('Error sending reset email:', error)
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}