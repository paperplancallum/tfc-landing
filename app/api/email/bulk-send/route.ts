import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailFrequency } from '@/lib/email/service';
import { createServiceClient } from '@/lib/supabase/service';

// Helper function to verify CRON authorization
function isAuthorizedCronRequest(request: NextRequest): boolean {
  // Check for Vercel CRON authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // For Vercel CRON jobs (they use a specific authorization header)
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  
  // Also check if this is coming from Vercel's CRON system
  // Vercel adds this header to CRON requests
  const vercelCron = request.headers.get('x-vercel-cron');
  if (vercelCron === '1') {
    console.log('Request authorized via Vercel CRON header');
    return true;
  }
  
  return false;
}

// GET handler for Vercel CRON jobs
export async function GET(request: NextRequest) {
  try {
    console.log('Email bulk-send GET request received');
    
    // Verify authorization
    if (!isAuthorizedCronRequest(request)) {
      console.error('Unauthorized CRON request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get frequency from query params
    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get('frequency') as EmailFrequency;

    if (!frequency) {
      return NextResponse.json({ error: 'Frequency is required' }, { status: 400 });
    }

    console.log(`Running email bulk send for frequency: ${frequency}`);

    // Use service client for bulk operations
    const supabase = createServiceClient();
    const emailService = new EmailService(supabase);
    const results = await emailService.bulkSendDigests(frequency);

    console.log(`Email bulk send completed: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      results,
      message: `Sent ${results.sent} emails, ${results.failed} failed`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in bulk-send GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST handler for manual triggers
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

    console.log(`Running manual email bulk send for frequency: ${frequency}`);

    // Use service client for bulk operations
    const supabase = createServiceClient();
    const emailService = new EmailService(supabase);
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