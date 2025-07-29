import { NextRequest, NextResponse } from 'next/server';
import DealDigestFreeEmail from '@/emails/deal-digest-free';
import DealDigestPremiumEmail from '@/emails/deal-digest-premium';
import { renderAsync } from '@react-email/render';

// Sample data for preview
const sampleDeals = [
  {
    id: '1',
    departure_city: 'London',
    destination_city: 'Barcelona',
    price: 34,
    currency: '$',
    trip_length: 4,
    travel_month: 'July 2024',
    photo_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
    found_at: 'June 27',
    is_premium: false,
    booking_url: 'https://example.com',
  },
  {
    id: '2',
    departure_city: 'London',
    destination_city: 'Paris',
    price: 45,
    currency: '$',
    trip_length: 3,
    travel_month: 'August 2024',
    photo_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    found_at: 'June 27',
    is_premium: false,
    booking_url: 'https://example.com',
  },
  {
    id: '3',
    departure_city: 'London',
    destination_city: 'Rome',
    price: 52,
    currency: '$',
    trip_length: 5,
    travel_month: 'September 2024',
    photo_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    found_at: 'June 27',
    is_premium: true,
    booking_url: 'https://example.com',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'free';
  const format = searchParams.get('format') || 'html';

  let emailComponent;
  let html: string;

  try {
    if (type === 'premium') {
      emailComponent = DealDigestPremiumEmail({
        edition: 'June 24, 2024',
        dealsList: sampleDeals,
        unsubscribeUrl: '#',
      });
      html = await renderAsync(emailComponent);
    } else {
      const freeDeals = sampleDeals.filter(d => !d.is_premium);
      const premiumDeals = sampleDeals.filter(d => d.is_premium);
      
      emailComponent = DealDigestFreeEmail({
        edition: 'June 24, 2024',
        freeDealsList: freeDeals,
        premiumDealsList: premiumDeals,
        unsubscribeUrl: '#',
      });
      html = await renderAsync(emailComponent);
    }

    if (format === 'json') {
      return NextResponse.json({
        type,
        html,
      });
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error rendering email:', error);
    return NextResponse.json(
      { error: 'Failed to render email template' },
      { status: 500 }
    );
  }
}