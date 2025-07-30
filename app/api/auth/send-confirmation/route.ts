import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ConfirmEmail from '@/emails/confirm-email'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export async function POST(request: NextRequest) {
  try {
    const { email, userId, userName } = await request.json()
    
    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }
    
    if (!resend) {
      console.error('Resend API key not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
    const supabase = await createClient()
    
    // Generate a secure confirmation token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24 hour expiry
    
    // Store the token in the database
    const { error: tokenError } = await supabase
      .from('users')
      .update({
        email_confirmation_token: token,
        email_confirmation_expires: expires.toISOString(),
      })
      .eq('id', userId)
    
    if (tokenError) {
      console.error('Error storing confirmation token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to generate confirmation token' },
        { status: 500 }
      )
    }
    
    // Create confirmation URL
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/confirm-email?token=${token}&email=${encodeURIComponent(email)}`
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Tom\'s Flight Club <deals@tomsflightclub.com>',
      to: email,
      subject: 'Confirm your email for Tom\'s Flight Club',
      html: await render(ConfirmEmail({
        userName: userName || email.split('@')[0],
        confirmationUrl,
      })),
    })
    
    if (error) {
      console.error('Error sending confirmation email:', error)
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
      emailId: data?.id,
    })
  } catch (error) {
    console.error('Error in send-confirmation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}