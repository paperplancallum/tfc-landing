import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { EmailService } from '@/lib/email/service';

// Test endpoint to verify email sending for users without home city
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const supabase = createServiceClient();
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId || '019686e2-f252-44c4-a64b-27ce2cc6c5fb') // Default to test user
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Temporarily clear home_city_id to test
    const originalHomeCityId = user.home_city_id;
    user.home_city_id = null;
    
    // Get deals using the email service method
    const emailService = new EmailService();
    const getDealsForUser = (emailService as any).getDealsForUser.bind(emailService);
    const deals = await getDealsForUser(user, supabase);
    
    // Get unique cities from deals
    const uniqueCities = [...new Set(deals.map(d => d.from_airport_city))];
    
    return NextResponse.json({
      user: {
        email: user.email,
        plan: user.plan,
        originalHomeCityId,
        testHomeCityId: null
      },
      dealsFound: deals.length,
      uniqueCities: uniqueCities.length,
      cities: uniqueCities,
      sampleDeals: deals.slice(0, 3).map(d => ({
        from: d.from_airport_city,
        to: d.to_airport_city,
        price: d.price,
        dealFoundDate: d.deal_found_date
      })),
      emailSubject: `Flight Deals from multiple cities - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}