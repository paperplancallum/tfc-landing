'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Crown, AlertCircle } from 'lucide-react'

interface MembershipPanelProps {
  profile: any
  subscription: any
}

export function MembershipPanel({ profile, subscription }: MembershipPanelProps) {
  const isPremium = profile?.plan === 'premium'
  
  // For demo purposes, if no subscription but user is premium, 
  // show as cancelled based on URL parameter
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const demoCancel = urlParams?.get('demo_cancel') === 'true'
  
  // Format the cancellation date if subscription is set to cancel
  const getFormattedEndDate = () => {
    // Try different fields that might contain the end date
    const endDateStr = subscription?.stripe_current_period_end || 
                      subscription?.subscription_end_date || 
                      subscription?.current_period_end
    
    if (endDateStr) {
      const endDate = new Date(endDateStr)
      return endDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    // Demo date: 30 days from now
    if (demoCancel) {
      const demoDate = new Date()
      demoDate.setDate(demoDate.getDate() + 30)
      return demoDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    return null
  }

  const getSubscriptionDetails = () => {
    if (!subscription) return null

    const planNames = {
      'premium_3mo': '3 Month',
      'premium_6mo': '6 Month', 
      'premium_year': 'Yearly'
    }

    const planName = planNames[subscription.plan as keyof typeof planNames] || 'Premium'
    
    // Calculate days until end
    const endDateStr = subscription.current_period_end || subscription.stripe_current_period_end
    const daysRemaining = endDateStr ? Math.ceil((new Date(endDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

    return {
      planName,
      status: subscription.status,
      endDate: getFormattedEndDate(),
      daysRemaining,
      isTrialing: subscription.status === 'trialing'
    }
  }

  const handleManageSubscription = () => {
    // Open Stripe customer portal with pre-filled email
    const portalUrl = 'https://billing.stripe.com/p/login/test_3cI6oG3T599Pfr28VG5J600'
    const email = profile?.email || ''
    
    // Add email as URL parameter to pre-fill the form
    const urlWithEmail = email ? `${portalUrl}?prefilled_email=${encodeURIComponent(email)}` : portalUrl
    
    window.open(urlWithEmail, '_blank')
  }

  const isCancelling = subscription?.stripe_cancel_at_period_end === true || 
    subscription?.cancellation_date !== null || 
    (!subscription && isPremium && demoCancel)
  
  const subscriptionDetails = getSubscriptionDetails()
  
  // Debug logging
  console.log('MembershipPanel data:', JSON.stringify({
    isPremium,
    hasSubscription: !!subscription,
    subscriptionData: subscription,
    isCancelling,
    demoCancel,
    stripe_cancel_at_period_end: subscription?.stripe_cancel_at_period_end,
    stripe_current_period_end: subscription?.stripe_current_period_end
  }, null, 2))

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className={isPremium ? 'text-primary' : 'text-gray-400'} size={32} />
            <div>
              <h3 className="text-xl font-semibold">
                {isPremium ? 'Premium Membership' : 'Free Membership'}
              </h3>
              <p className="text-gray-600">
                {isPremium ? 'Enjoy exclusive benefits' : 'Upgrade to unlock more deals'}
              </p>
            </div>
          </div>
        </div>

        {isPremium ? (
          <>
            {isCancelling ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-900 font-medium mb-1">
                      Your subscription is set to cancel
                    </p>
                    <p className="text-red-700 text-sm">
                      Your premium access will end on {getFormattedEndDate()}
                    </p>
                  </div>
                </div>
              </div>
            ) : !subscription ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-blue-900 font-medium mb-1">
                      Loading subscription details...
                    </p>
                    <p className="text-blue-700 text-sm">
                      Your subscription is being processed. This may take a few moments.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary/10 rounded-lg p-6 mb-6">
                <p className="text-primary font-medium mb-3">
                  ✓ You have full access to all premium features
                </p>
                {subscription && subscriptionDetails && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{subscriptionDetails.planName} Membership</span>
                    </div>
                    {subscriptionDetails.isTrialing && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-yellow-600">Trial Period</span>
                      </div>
                    )}
                    {subscriptionDetails.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {subscriptionDetails.isTrialing ? 'Trial ends:' : 'Next billing:'}
                        </span>
                        <span className="font-medium">
                          {subscriptionDetails.endDate}
                          {subscriptionDetails.daysRemaining && subscriptionDetails.daysRemaining <= 7 && (
                            <span className="text-yellow-600 ml-1">
                              ({subscriptionDetails.daysRemaining} days)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleManageSubscription}
              >
                {isCancelling ? 'Reactivate Subscription' : 'Manage Subscription'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold mb-3">What you're missing:</h4>
              <ul className="space-y-2 text-sm">
                <li>• 9 daily deals instead of 3</li>
                <li>• Deals 3 hours earlier (7 AM vs 10 AM)</li>
                <li>• Access to premium-only deals</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
            
            <Link href="/join">
              <Button className="w-full" size="lg">
                Upgrade to Premium
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}