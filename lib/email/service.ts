import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import DealDigestFreeEmail from '@/emails/deal-digest-free';
import DealDigestPremiumEmail from '@/emails/deal-digest-premium';
import { format } from 'date-fns';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type EmailFrequency = 'never' | 'daily' | 'three_weekly' | 'twice_weekly' | 'weekly';

interface Deal {
  id: string;
  from_airport_city: string;
  to_airport_city: string;
  price: string;
  currency: string;
  trip_duration: number;
  departure_date: string;
  return_date: string;
  destination_city_image?: string;
  deal_found_date: string;
  is_premium?: boolean;
  airline?: string;
  from_airport_code: string;
  to_airport_code: string;
  to_airport_country: string;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  plan: 'free' | 'premium';
  home_city_id?: string;
}

export class EmailService {

  async sendDigestEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();
      
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Get user's email preferences
      const { data: preferences, error: prefsError } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (prefsError || !preferences || !preferences.is_subscribed || preferences.email_frequency === 'never') {
        return { success: false, error: 'User not subscribed to emails' };
      }

      // Get deals for the user's home city
      const deals = await this.getDealsForUser(user as User, supabase);

      if (deals.length === 0) {
        return { success: false, error: 'No deals available for user' };
      }

      // Send appropriate email based on user plan
      const emailResult = await this.sendEmail(user as User, deals, supabase);

      if (emailResult.success) {
        // Update last sent timestamp
        await supabase
          .from('email_preferences')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('user_id', userId);

        // Log email send
        await this.logEmailSend(
          userId,
          user.plan === 'premium' ? 'digest_premium' : 'digest_free',
          deals.length,
          'sent',
          emailResult.resendId,
          undefined,
          supabase
        );
      }

      return emailResult;
    } catch (error) {
      console.error('Error sending digest email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async getDealsForUser(user: User, supabase: any): Promise<Deal[]> {
    let deals: Deal[] = [];

    // If user has a home city, get deals from that city
    if (user.home_city_id) {
      // Get the city name from the city ID
      const { data: city } = await supabase
        .from('cities')
        .select('name')
        .eq('id', user.home_city_id)
        .single();
      
      if (city) {
        const { data: cityDeals, error } = await supabase
          .from('deals')
          .select('*')
          .eq('from_airport_city', city.name)
          .order('deal_found_date', { ascending: false })
          .limit(10); // Fetch more deals to have enough for free + premium sections

        if (!error && cityDeals) {
          deals = cityDeals;
        }
      }
    } else {
      // User has no home city - get most recent deal from each city (like /deals page)
      const { data: allDeals, error } = await supabase
        .from('deals')
        .select('*')
        .order('deal_found_date', { ascending: false }); // Order by when deal was found, not created
      
      if (error || !allDeals) {
        console.error('Error fetching deals:', error);
        return [];
      }

      // Get only the most recent deal per departure city
      const seenCities = new Set<string>();
      const dealsByCity: Deal[] = [];
      
      for (const deal of allDeals) {
        const cityKey = deal.from_airport_city || deal.from_airport_code;
        
        // Skip if we've already seen a deal from this city
        if (seenCities.has(cityKey)) {
          continue;
        }
        
        seenCities.add(cityKey);
        dealsByCity.push(deal);
        
        // Limit to 9 deals total for email
        if (dealsByCity.length >= 9) {
          break;
        }
      }
      
      deals = dealsByCity;
      console.log(`Found ${deals.length} deals from different cities for user without home city`);
    }

    // Get all airports with city images
    const { data: airports } = await supabase
      .from('airports')
      .select('iata_code, city_image_url');
    
    // Create a map for quick lookup
    const airportImageMap = new Map(airports?.map(a => [a.iata_code, a.city_image_url]) || []);
    
    // Add destination city images to deals with optimization for email
    const dealsWithImages = deals.map(deal => {
      const baseImageUrl = (deal.to_airport_code || deal.destination_airport) 
        ? airportImageMap.get(deal.to_airport_code || deal.destination_airport) 
        : null;
      
      // If we have an image URL, optimize it for email
      let optimizedImageUrl = null;
      if (baseImageUrl) {
        // Option 1: Use a free image proxy service to resize
        // This uses wsrv.nl which is a free image proxy that supports resizing
        const encodedUrl = encodeURIComponent(baseImageUrl);
        optimizedImageUrl = `https://wsrv.nl/?url=${encodedUrl}&w=400&h=300&fit=cover&q=80`;
        
        // Alternative option: Use Cloudinary's fetch API (if you have an account)
        // optimizedImageUrl = `https://res.cloudinary.com/[your-cloud-name]/image/fetch/w_400,h_300,c_fill,q_80/${baseImageUrl}`;
      }
      
      return {
        ...deal,
        destination_city_image: optimizedImageUrl
      };
    });

    return dealsWithImages as Deal[];
  }

  private async sendEmail(user: User, deals: Deal[], supabase: any): Promise<{ success: boolean; error?: string; resendId?: string }> {
    try {
      if (!resend) {
        console.error('Resend API key not configured');
        return { success: false, error: 'Email service not configured. Please set RESEND_API_KEY.' };
      }
      
      const edition = format(new Date(), 'MMMM d, yyyy');
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${user.id}`;
      
      // Get the city name from the deals or user's home city
      let cityName = 'your city';
      if (user.home_city_id && deals.length > 0) {
        // User has a home city - use that city name
        cityName = deals[0].from_airport_city;
      } else if (user.home_city_id) {
        // User has home city but no deals - get city name
        const { data: city } = await supabase
          .from('cities')
          .select('name')
          .eq('id', user.home_city_id)
          .single();
        if (city) cityName = city.name;
      } else {
        // User has no home city - use generic text for multi-city deals
        cityName = 'multiple cities';
      }

      let emailHtml: string;
      let subject: string;

      if (user.plan === 'premium') {
        // Premium users get all deals
        const { html } = await resend.emails.send({
          from: 'Tom\'s Flight Club <deals@tomsflightclub.com>',
          to: user.email,
          subject: `Flight Deals from ${cityName} - ${edition}`,
          react: DealDigestPremiumEmail({
            edition,
            dealsList: deals,
            unsubscribeUrl,
            cityName,
          }),
        });

        emailHtml = html || '';
        subject = `Flight Deals from ${cityName} - ${edition}`;
      } else {
        // Free users get 1 free deal (the newest) and the rest as premium deals
        const freeDeals = deals.slice(0, 1); // Only the newest deal is free
        const premiumDeals = deals.slice(1, 6); // Next 5 deals are shown as premium

        const { html, id } = await resend.emails.send({
          from: 'Tom\'s Flight Club <deals@tomsflightclub.com>',
          to: user.email,
          subject: `Flight Deals from ${cityName} - ${edition}`,
          react: DealDigestFreeEmail({
            edition,
            freeDealsList: freeDeals,
            premiumDealsList: premiumDeals,
            unsubscribeUrl,
            cityName,
          }),
        });

        emailHtml = html || '';
        subject = `Flight Deals from ${cityName} - ${edition}`;
        
        return { success: true, resendId: id };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async logEmailSend(
    userId: string,
    emailType: 'digest_free' | 'digest_premium',
    dealCount: number,
    status: 'sent' | 'failed' | 'bounced',
    resendId?: string,
    errorMessage?: string,
    supabase?: any
  ) {
    const client = supabase || await createClient();
    await client.from('email_send_history').insert({
      user_id: userId,
      email_type: emailType,
      deal_count: dealCount,
      status,
      resend_id: resendId,
      error_message: errorMessage,
    });
  }

  async bulkSendDigests(frequency: EmailFrequency): Promise<{ sent: number; failed: number }> {
    const results = { sent: 0, failed: 0 };

    try {
      const supabase = await createClient();
      
      // Get all users subscribed to this frequency
      const { data: subscribers, error } = await supabase
        .from('email_preferences')
        .select('user_id')
        .eq('email_frequency', frequency)
        .eq('is_subscribed', true);

      if (error || !subscribers) {
        console.error('Error fetching subscribers:', error);
        return results;
      }

      // Process in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const promises = batch.map(sub => this.sendDigestEmail(sub.user_id));
        
        const batchResults = await Promise.allSettled(promises);
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            results.sent++;
          } else {
            results.failed++;
          }
        });

        // Wait a bit between batches to avoid rate limits
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulk send:', error);
      return results;
    }
  }

  async updateEmailPreferences(
    userId: string,
    frequency: EmailFrequency,
    isSubscribed: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          email_frequency: frequency,
          is_subscribed: isSubscribed,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async unsubscribeUser(userId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateEmailPreferences(userId, 'never', false);
  }
}