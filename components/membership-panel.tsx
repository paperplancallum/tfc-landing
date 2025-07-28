'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Crown, Calendar, CreditCard } from 'lucide-react'
import { format } from 'date-fns'

interface MembershipPanelProps {
  profile: any
  subscription: any
}

export function MembershipPanel({ profile, subscription }: MembershipPanelProps) {
  const isPremium = profile?.plan === 'premium'

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
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Current period ends</p>
                  <p className="font-medium">
                    {subscription?.current_period_end 
                      ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CreditCard className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium">
                    {subscription?.plan === 'premium_year' && 'Yearly'}
                    {subscription?.plan === 'premium_6mo' && '6 Months'}
                    {subscription?.plan === 'premium_3mo' && '3 Months'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                Change Plan
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                Cancel Membership
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