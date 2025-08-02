'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CurrencySelector, CurrencyCode, getDefaultCurrency } from './currency-selector'
import { getFormattedPlans, getBillingDescription } from '@/lib/pricing-data'

export function PlanSelector() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('GBP')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Set default currency
    setSelectedCurrency(getDefaultCurrency())
    
    // Get the current user's email if logged in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  // Save currency preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredCurrency', selectedCurrency)
    }
  }, [selectedCurrency])

  const plans = getFormattedPlans(selectedCurrency)
  
  const handleSelectPlan = async (planId: string) => {
    setLoading(planId)
    
    try {
      // Use our API to create a checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail || '', // Send empty string if no email
          plan: planId,
          currency: selectedCurrency,
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
      {/* Currency Selector */}
      <div className="flex justify-end mb-6">
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      </div>

      {/* Pricing Cards */}
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
              <span className="text-4xl font-bold text-gray-900">{plan.pricing.monthly}</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              {getBillingDescription(plan.id, selectedCurrency)}
            </p>
            
            <Button
              onClick={() => handleSelectPlan(plan.id)}
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
            
            {plan.pricing.savings && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                Save {plan.pricing.savings}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}