import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Debug endpoint to see what the email service would send
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get('frequency') || 'daily';
    
    // Use service client like the email service does
    const supabase = createServiceClient();
    
    // Exact same query as bulkSendDigests
    const { data: subscribers, error } = await supabase
      .from('email_preferences')
      .select('user_id')
      .eq('email_frequency', frequency)
      .eq('is_subscribed', true);

    if (error) {
      return NextResponse.json({ 
        error: 'Query failed', 
        details: error.message 
      }, { status: 500 });
    }

    // Get more details about these subscribers
    let userDetails = [];
    if (subscribers && subscribers.length > 0) {
      for (const sub of subscribers) {
        const { data: user } = await supabase
          .from('users')
          .select('email, plan')
          .eq('id', sub.user_id)
          .single();
        
        if (user) {
          userDetails.push({
            user_id: sub.user_id,
            email: user.email,
            plan: user.plan
          });
        }
      }
    }

    // Also check all preferences to debug
    const { data: allPrefs } = await supabase
      .from('email_preferences')
      .select('user_id, email_frequency, is_subscribed')
      .order('created_at', { ascending: false })
      .limit(10);

    const summary = {
      requestedFrequency: frequency,
      subscribersFound: subscribers?.length || 0,
      subscriberIds: subscribers?.map(s => s.user_id) || [],
      userDetails: userDetails,
      allPreferencesDebug: allPrefs,
      note: subscribers?.length > 0 
        ? `Found ${subscribers.length} subscribers for ${frequency} emails`
        : `No subscribers found for ${frequency} frequency`
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}