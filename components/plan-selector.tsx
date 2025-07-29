'use client'

import { Button } from '@/components/ui/button'

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

export function PlanSelector({ plans }: { plans: Plan[] }) {
  const handleSelectPlan = async (plan: Plan) => {
    try {
      // Use our API to create a checkout session with proper redirects
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: plan.id }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        console.error('Checkout session error:', data.error)
        // Fallback to payment link if available
        if (plan.stripeLink) {
          window.location.href = plan.stripeLink
        }
      }
    } catch (error) {
      console.error('Error:', error)
      // Fallback to payment link if available
      if (plan.stripeLink) {
        window.location.href = plan.stripeLink
      }
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
            >
              Select Plan
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