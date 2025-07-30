import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user details from database
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // Get Stripe subscription details if user has stripe_customer_id
    let stripeSubscription = null
    let upcomingInvoice = null
    
    if (stripe && dbUser.stripe_customer_id && subscription?.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        )
        
        // Get upcoming invoice to show next payment
        if (stripeSubscription.status === 'active') {
          upcomingInvoice = await stripe.invoices.retrieveUpcoming({
            customer: dbUser.stripe_customer_id,
          })
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe data:', stripeError)
      }
    }
    
    // Get any active win-back campaigns
    const { data: winBackCampaigns } = await supabase
      .from('win_back_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .eq('redeemed', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        plan: dbUser.plan,
        createdAt: dbUser.created_at,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.plan_id,
        planName: subscription.plan_name,
        priceAmount: subscription.price_amount,
        priceCurrency: subscription.price_currency,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        subscriptionEndDate: subscription.subscription_end_date,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.stripe_subscription_id,
      } : null,
      stripeDetails: stripeSubscription ? {
        status: stripeSubscription.status,
        cancelAt: stripeSubscription.cancel_at,
        canceledAt: stripeSubscription.canceled_at,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        nextPaymentDate: upcomingInvoice ? new Date(upcomingInvoice.next_payment_attempt! * 1000).toISOString() : null,
        nextPaymentAmount: upcomingInvoice?.amount_due,
      } : null,
      winBackOffers: winBackCampaigns?.map(campaign => ({
        id: campaign.id,
        campaignType: campaign.campaign_type,
        discountPercentage: campaign.discount_percentage,
        promoCode: campaign.stripe_promo_code,
        expiresAt: campaign.expires_at,
      })) || [],
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}