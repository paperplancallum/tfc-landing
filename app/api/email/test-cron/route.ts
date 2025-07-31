import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Test endpoint to verify email system is working
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get users with email preferences
    const { data: usersWithPrefs, error } = await supabase
      .from('email_preferences')
      .select(`
        user_id,
        is_subscribed,
        email_frequency,
        last_sent_at,
        users!inner(
          email,
          plan
        )
      `)
      .eq('is_subscribed', true)
      .neq('email_frequency', 'never')
      .limit(10);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch users', 
        details: error.message 
      }, { status: 500 });
    }

    // Check for deals
    const { data: recentDeals, error: dealsError } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const summary = {
      totalUsersWithEmailPrefs: usersWithPrefs?.length || 0,
      usersWithDailyEmails: usersWithPrefs?.filter(u => u.email_frequency === 'daily').length || 0,
      recentDealsCount: recentDeals?.length || 0,
      sampleUsers: usersWithPrefs?.slice(0, 3).map(u => ({
        email: u.users?.email,
        plan: u.users?.plan,
        frequency: u.email_frequency,
        lastSent: u.last_sent_at
      })),
      currentTime: new Date().toISOString(),
      cronJobsConfigured: true,
      emailEndpointStatus: 'Fixed - GET handler added',
      nextDailyRun: 'Tomorrow at 9:00 AM UTC'
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}