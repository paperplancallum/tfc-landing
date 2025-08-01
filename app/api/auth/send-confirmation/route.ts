import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ConfirmEmail from '@/emails/confirm-email'
import { createServiceClient } from '@/lib/supabase/service'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export async function POST(request: NextRequest) {
  console.log('Send confirmation endpoint called')
  
  try {
    const { email, userId, userName } = await request.json()
    console.log('Request data:', { email, userId, userName })
    
    if (!email || !userId) {
      console.error('Missing required fields:', { email, userId })
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }
    
    if (!resend) {
      console.error('Resend API key not configured - check RESEND_API_KEY env var')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Generate a secure confirmation token using Web Crypto API
    const randomValues = new Uint8Array(32)
    crypto.getRandomValues(randomValues)
    const token = Array.from(randomValues, byte => byte.toString(16).padStart(2, '0')).join('')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24 hour expiry
    
    // Store the token in the database
    console.log('Attempting to store token for userId:', userId)
    
    const { data: updateData, error: tokenError } = await supabase
      .from('users')
      .update({
        email_confirmation_token: token,
        email_confirmation_expires: expires.toISOString(),
      })
      .eq('id', userId)
      .select()
    
    if (tokenError) {
      console.error('Error storing confirmation token:', tokenError)
      // Try to check if user exists
      const { data: checkUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', userId)
        .single()
      
      console.error('User exists check:', checkUser)
      
      return NextResponse.json(
        { error: 'Failed to generate confirmation token' },
        { status: 500 }
      )
    }
    
    console.log('Token stored successfully:', updateData ? 'User updated' : 'No user found')
    
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
    
    console.log('Email sent successfully:', data?.id)
    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
      emailId: data?.id,
    })
  } catch (error) {
    console.error('Error in send-confirmation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}