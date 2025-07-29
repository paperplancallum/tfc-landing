import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/unsubscribed', request.url));
    }

    const supabase = createClient();
    
    // Update email preferences to unsubscribe
    const { error } = await supabase
      .from('email_preferences')
      .update({ 
        is_subscribed: false,
        email_frequency: 'never',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', token);

    if (error) {
      console.error('Error unsubscribing user:', error);
      // Even if there's an error, redirect to unsubscribed page
      // to avoid showing error to user
    }

    // Redirect to unsubscribed confirmation page
    return NextResponse.redirect(new URL('/unsubscribed', request.url));
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(new URL('/unsubscribed', request.url));
  }
}