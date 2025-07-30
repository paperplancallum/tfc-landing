import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WinBackCampaignEmail from '@/emails/win-back-campaign'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// Discount percentages for each campaign
const CAMPAIGN_DISCOUNTS = {
  day_3: 20,
  day_7: 25,
  day_14: 30,
  day_30: 30, // Plus bonus month
}

export class WinBackService {
  async checkAndSendWinBackCampaigns() {
    const supabase = await createClient()
    
    // Get all users whose subscriptions expired in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: expiredSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        subscription_end_date,
        users!inner (
          id,
          email,
          name,
          plan
        )
      `)
      .eq('status', 'canceled')
      .eq('users.plan', 'free') // Only target users who are now on free plan
      .gte('subscription_end_date', thirtyDaysAgo.toISOString())
      .order('subscription_end_date', { ascending: false })
    
    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('No expired subscriptions to process')
      return
    }
    
    for (const subscription of expiredSubscriptions) {
      const daysSinceExpiration = Math.floor(
        (Date.now() - new Date(subscription.subscription_end_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Check which campaign to send
      let campaignType: string | null = null
      if (daysSinceExpiration === 3) campaignType = 'day_3'
      else if (daysSinceExpiration === 7) campaignType = 'day_7'
      else if (daysSinceExpiration === 14) campaignType = 'day_14'
      else if (daysSinceExpiration === 30) campaignType = 'day_30'
      
      if (!campaignType) continue
      
      // Check if we've already sent this campaign
      const { data: existingCampaign } = await supabase
        .from('win_back_campaigns')
        .select('id')
        .eq('user_id', subscription.user_id)
        .eq('campaign_type', campaignType)
        .single()
      
      if (existingCampaign) {
        console.log(`Campaign ${campaignType} already sent to user ${subscription.user_id}`)
        continue
      }
      
      // Create discount code in Stripe
      const discountCode = await this.createStripeDiscount(
        subscription.users.email,
        campaignType,
        CAMPAIGN_DISCOUNTS[campaignType as keyof typeof CAMPAIGN_DISCOUNTS]
      )
      
      if (!discountCode) {
        console.error(`Failed to create discount code for user ${subscription.user_id}`)
        continue
      }
      
      // Record the campaign
      const { data: campaign } = await supabase
        .from('win_back_campaigns')
        .insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          campaign_type: campaignType,
          discount_percentage: CAMPAIGN_DISCOUNTS[campaignType as keyof typeof CAMPAIGN_DISCOUNTS],
          stripe_coupon_id: discountCode.couponId,
          stripe_promo_code: discountCode.code,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single()
      
      // Send the email
      if (resend && campaign) {
        const reactivateUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/join?code=${discountCode.code}`
        
        const specialMessage = campaignType === 'day_30' 
          ? 'Plus, we\'ll add an extra month FREE to sweeten the deal!' 
          : undefined
        
        await resend.emails.send({
          from: 'Tom\'s Flight Club <deals@tomsflightclub.com>',
          to: subscription.users.email,
          subject: this.getEmailSubject(campaignType, CAMPAIGN_DISCOUNTS[campaignType as keyof typeof CAMPAIGN_DISCOUNTS]),
          html: await render(WinBackCampaignEmail({
            userName: subscription.users.name,
            daysSinceExpiration,
            discountPercentage: CAMPAIGN_DISCOUNTS[campaignType as keyof typeof CAMPAIGN_DISCOUNTS],
            discountCode: discountCode.code,
            expiresIn: '30 days',
            reactivateUrl,
            specialMessage,
          })),
        })
        
        console.log(`Sent ${campaignType} campaign to ${subscription.users.email}`)
      }
    }
  }
  
  private async createStripeDiscount(
    userEmail: string, 
    campaignType: string, 
    percentage: number
  ): Promise<{ couponId: string; code: string } | null> {
    if (!stripe) return null
    
    try {
      // Create or reuse a coupon
      const couponId = `WINBACK_${percentage}_PERCENT`
      let coupon: Stripe.Coupon
      
      try {
        // Try to retrieve existing coupon
        coupon = await stripe.coupons.retrieve(couponId)
      } catch (error) {
        // Create new coupon if it doesn't exist
        coupon = await stripe.coupons.create({
          id: couponId,
          percent_off: percentage,
          duration: 'repeating',
          duration_in_months: 3, // Discount applies for 3 months
          metadata: {
            type: 'win_back',
            campaign: campaignType,
          }
        })
      }
      
      // Create a unique promotion code for this user
      const code = `COMEBACK${percentage}_${Date.now().toString(36).toUpperCase()}`
      
      await stripe.promotionCodes.create({
        coupon: coupon.id,
        code,
        max_redemptions: 1,
        metadata: {
          user_email: userEmail,
          campaign_type: campaignType,
        },
        expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      })
      
      return { couponId: coupon.id, code }
    } catch (error) {
      console.error('Error creating Stripe discount:', error)
      return null
    }
  }
  
  private getEmailSubject(campaignType: string, percentage: number): string {
    const subjects = {
      day_3: `We miss you! Here's ${percentage}% off to come back 💔`,
      day_7: `Special offer just for you - ${percentage}% off ✈️`,
      day_14: `Last chance! ${percentage}% off premium membership ⏰`,
      day_30: `FINAL OFFER: ${percentage}% off + FREE bonus month 🚨`,
    }
    return subjects[campaignType as keyof typeof subjects] || 'Come back to Tom\'s Flight Club'
  }
  
  // Method to manually trigger a win-back campaign for testing
  async sendTestCampaign(userEmail: string, campaignType: string) {
    const supabase = await createClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()
    
    if (!user) {
      throw new Error('User not found')
    }
    
    const percentage = CAMPAIGN_DISCOUNTS[campaignType as keyof typeof CAMPAIGN_DISCOUNTS]
    if (!percentage) {
      throw new Error('Invalid campaign type')
    }
    
    const discountCode = await this.createStripeDiscount(userEmail, campaignType, percentage)
    if (!discountCode) {
      throw new Error('Failed to create discount code')
    }
    
    if (resend) {
      const reactivateUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/join?code=${discountCode.code}`
      
      await resend.emails.send({
        from: 'Tom\'s Flight Club <deals@tomsflightclub.com>',
        to: userEmail,
        subject: this.getEmailSubject(campaignType, percentage),
        html: await render(WinBackCampaignEmail({
          userName: user.name,
          daysSinceExpiration: parseInt(campaignType.split('_')[1]),
          discountPercentage: percentage,
          discountCode: discountCode.code,
          expiresIn: '30 days',
          reactivateUrl,
          specialMessage: campaignType === 'day_30' ? 'Plus, we\'ll add an extra month FREE!' : undefined,
        })),
      })
    }
    
    return { success: true, discountCode: discountCode.code }
  }
}