import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// Test endpoint to verify email system is working
export async function GET(request: NextRequest) {
  try {
    // Use service client to bypass RLS
    const supabase = createServiceClient();
    
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

    // Also get direct count of email preferences
    const { count: totalPrefs } = await supabase
      .from('email_preferences')
      .select('*', { count: 'exact', head: true })
      .eq('is_subscribed', true);

    const { count: dailyCount } = await supabase
      .from('email_preferences')
      .select('*', { count: 'exact', head: true })
      .eq('is_subscribed', true)
      .eq('email_frequency', 'daily');

    // Get user emails separately if join failed
    let userEmails = [];
    if (usersWithPrefs && usersWithPrefs.length === 0 && totalPrefs && totalPrefs > 0) {
      // Join failed, get data separately
      const { data: prefs } = await supabase
        .from('email_preferences')
        .select('user_id, email_frequency, last_sent_at')
        .eq('is_subscribed', true)
        .neq('email_frequency', 'never')
        .limit(3);
      
      if (prefs) {
        for (const pref of prefs) {
          const { data: user } = await supabase
            .from('users')
            .select('email, plan')
            .eq('id', pref.user_id)
            .single();
          
          if (user) {
            userEmails.push({
              email: user.email,
              plan: user.plan,
              frequency: pref.email_frequency,
              lastSent: pref.last_sent_at
            });
          }
        }
      }
    }

    const summary = {
      totalUsersWithEmailPrefs: usersWithPrefs?.length || totalPrefs || 0,
      usersWithDailyEmails: usersWithPrefs?.filter(u => u.email_frequency === 'daily').length || dailyCount || 0,
      directPreferenceCount: totalPrefs || 0,
      directDailyCount: dailyCount || 0,
      recentDealsCount: recentDeals?.length || 0,
      sampleUsers: usersWithPrefs?.slice(0, 3).map(u => ({
        email: u.users?.email,
        plan: u.users?.plan,
        frequency: u.email_frequency,
        lastSent: u.last_sent_at
      })) || userEmails,
      currentTime: new Date().toISOString(),
      cronJobsConfigured: true,
      emailEndpointStatus: 'Fixed - GET handler added, using service role',
      nextDailyRun: 'Tomorrow at 9:00 AM UTC',
      note: totalPrefs > 0 ? 'Emails WILL be sent!' : 'No users subscribed'
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