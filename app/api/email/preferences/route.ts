import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailFrequency } from '@/lib/email/service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email preferences
    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        email_frequency: 'daily',
        is_subscribed: true,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email_frequency, is_subscribed } = body as {
      email_frequency: EmailFrequency;
      is_subscribed: boolean;
    };

    // Validate input
    const validFrequencies = ['never', 'daily', 'three_weekly', 'twice_weekly', 'weekly'];
    if (!validFrequencies.includes(email_frequency)) {
      return NextResponse.json({ error: 'Invalid email frequency' }, { status: 400 });
    }

    const emailService = new EmailService();
    const result = await emailService.updateEmailPreferences(
      user.id,
      email_frequency,
      is_subscribed
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Preferences updated' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}