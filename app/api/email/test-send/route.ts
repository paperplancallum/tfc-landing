import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';
import { createServiceClient } from '@/lib/supabase/service';

// Test endpoint to send email to a specific user
// Usage: /api/email/test-send?userId=USER_ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        usage: '/api/email/test-send?userId=YOUR_USER_ID',
        example: '/api/email/test-send?userId=019686e2-f252-44c4-a64b-27ce2cc6c5fb'
      }, { status: 400 });
    }

    // Use service client to bypass RLS
    const supabase = createServiceClient();
    
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, plan, home_city_id')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'User not found',
        userId,
        details: userError?.message
      }, { status: 404 });
    }

    console.log('Sending test email to:', user.email);

    // Send email using the service
    const emailService = new EmailService();
    const result = await emailService.sendDigestEmail(userId);

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: `Test email sent successfully to ${user.email}`,
        user: {
          email: user.email,
          plan: user.plan,
          hasHomeCity: !!user.home_city_id
        },
        resendId: result.resendId,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false,
        error: result.error,
        user: {
          email: user.email,
          plan: user.plan,
          hasHomeCity: !!user.home_city_id
        },
        possibleReasons: [
          'RESEND_API_KEY not set in environment variables',
          'User has no email preferences or is unsubscribed',
          'No deals available for user',
          'Email service configuration issue'
        ]
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test-send endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}