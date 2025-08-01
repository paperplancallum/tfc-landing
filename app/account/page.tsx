import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountTabs } from '@/components/account-tabs'
import Stripe from 'stripe'
import { getPlanFromSubscription } from '@/lib/stripe-helpers'

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // If user doesn't have a profile, create one
  if (profileError || !profile) {
    console.log('No profile found for user:', user.id, 'Creating one...')
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        plan: 'free',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating profile:', createError)
      // Redirect to login to restart the flow
      redirect('/auth/login')
    }
    
    // Use the newly created profile
    const finalProfile = newProfile || { id: user.id, email: user.email, plan: 'free' }
    return <AccountTabs user={user} profile={finalProfile} homeCity={null} subscription={null} />
  }

  // Get user's home city
  let homeCity = null
  if (profile?.home_city_id) {
    const { data: city } = await supabase
      .from('cities')
      .select('*')
      .eq('id', profile.home_city_id)
      .single()
    homeCity = city
  }

  // Get subscription info - including those set to cancel at period end
  let { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'past_due']) // Include all active-like statuses
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  // Debug logging
  console.log('Account page subscription query:', {
    found: !!subscription,
    data: subscription,
    stripe_cancel_at_period_end: subscription?.stripe_cancel_at_period_end,
    cancellation_date: subscription?.cancellation_date,
    subscription_end_date: subscription?.subscription_end_date
  })

  // If no subscription found but user has premium plan and stripe_customer_id, 
  // try to fetch from Stripe directly (temporary fallback)
  if (!subscription && profile?.plan === 'premium' && profile?.stripe_customer_id && stripe) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 1
      })
      
      if (subscriptions.data.length > 0) {
        const stripeSub = subscriptions.data[0]
        // Create a temporary subscription object with Stripe data
        const plan = getPlanFromSubscription(stripeSub)
        subscription = {
          id: stripeSub.id,
          stripe_subscription_id: stripeSub.id,
          stripe_sub_id: stripeSub.id,
          status: stripeSub.status,
          plan,
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: stripeSub.cancel_at_period_end,
          // Set cancellation fields if subscription is set to cancel
          cancellation_date: stripeSub.cancel_at_period_end ? new Date().toISOString() : null,
          subscription_end_date: stripeSub.cancel_at_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
          trial_end: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null
        }
        
        // Also create the subscription record in the database
        const { error: insertError } = await supabase.from('subscriptions').insert({
          user_id: user.id,
          stripe_sub_id: stripeSub.id,
          stripe_subscription_id: stripeSub.id,
          status: stripeSub.status,
          plan, // Using the plan variable declared above
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          stripe_current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          stripe_cancel_at_period_end: stripeSub.cancel_at_period_end || false,
          cancellation_date: stripeSub.cancel_at_period_end ? new Date().toISOString() : null,
          subscription_end_date: stripeSub.cancel_at_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
          trial_end: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null
        })
        
        if (insertError) {
          console.error('Failed to create subscription record:', insertError)
        }
      }
    } catch (error) {
      console.error('Error fetching subscription from Stripe:', error)
    }
  }

  // Check if user is admin
  const isAdmin = user.email === 'callum@paperplan.co'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <AccountTabs 
          user={user} 
          profile={profile} 
          subscription={subscription}
          homeCity={homeCity}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}