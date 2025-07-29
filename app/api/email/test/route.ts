import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use EmailService to send digest email
    const emailService = new EmailService();
    const result = await emailService.sendDigestEmail(user.id);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully! Check your inbox.' 
      });
    } else {
      return NextResponse.json({ 
        error: result.error || 'Failed to send test email' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}