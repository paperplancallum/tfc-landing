import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailFrequency } from '@/lib/email/service';

// This endpoint should be protected by a secret or cron job authentication
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job or admin
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { frequency } = body as { frequency: EmailFrequency };

    if (!frequency) {
      return NextResponse.json({ error: 'Frequency is required' }, { status: 400 });
    }

    const emailService = new EmailService();
    const results = await emailService.bulkSendDigests(frequency);

    return NextResponse.json({
      success: true,
      results,
      message: `Sent ${results.sent} emails, ${results.failed} failed`
    });
  } catch (error) {
    console.error('Error in bulk-send endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}