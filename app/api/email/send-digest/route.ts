import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Allow admin to send to specific user
    const body = await request.json();
    const targetUserId = body.userId || user.id;

    // Check if user is admin if trying to send to another user
    if (targetUserId !== user.id) {
      // Add your admin check logic here
      // For now, we'll just deny
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const emailService = new EmailService();
    const result = await emailService.sendDigestEmail(targetUserId);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in send-digest endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}