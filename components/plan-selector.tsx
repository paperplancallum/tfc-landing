'use client'

import { Button } from '@/components/ui/button'
import { getPlanConfigs } from './plan-configs'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  total: string
  featured: boolean
  badge?: string
  savings?: string
  stripeLink?: string
}

export function PlanSelector() {
  const { plans } = getPlanConfigs()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get the current user's email if logged in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  const [loading, setLoading] = useState<string | null>(null)
  
  const handleSelectPlan = async (plan: Plan) => {
    setLoading(plan.id)
    
    try {
      // Use our API to create a checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail || '', // Send empty string if no email
          plan: plan.id,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: window.location.href
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg p-8 text-center transition-all ${
              plan.featured
                ? 'bg-white shadow-xl scale-105 border-2 border-primary'
                : 'bg-gray-50'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                {plan.badge}
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-4 text-gray-900">{plan.name}</h3>
            
            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">{plan.total}</p>
            
            <Button
              onClick={() => handleSelectPlan(plan)}
              variant={plan.featured ? 'default' : 'outline'}
              className="w-full"
              size="lg"
              disabled={loading !== null}
            >
              {loading === plan.id ? 'Processing...' : 'Select Plan'}
            </Button>
            
            <div className="mt-4 inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              <span>✓</span> 3-day free trial available
            </div>
            
            {plan.savings && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                {plan.savings}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}