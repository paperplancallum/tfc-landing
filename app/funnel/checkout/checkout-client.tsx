'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Shield, Lock, CreditCard, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FunnelRecentDealsClient } from '@/components/funnel-recent-deals-client'

export default function CheckoutClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [selectedAirport, setSelectedAirport] = useState('')
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 50 })
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('yearly')

  useEffect(() => {
    // Get stored values
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('userEmail') || sessionStorage.getItem('checkoutEmail') || ''
      const storedAirport = sessionStorage.getItem('selectedAirport') || sessionStorage.getItem('checkoutAirport') || ''
      setEmail(storedEmail)
      setSelectedAirport(storedAirport)
      
      // Debug logging
      console.log('Checkout page loaded with:', { storedEmail, storedAirport })
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const faqs = [
    { q: "What is Tom's Flight Club?", a: "Tom's Flight Club is a flight deal alert service that finds and shares the best flight deals." },
    { q: "How does it work?", a: "We monitor prices 24/7 and send you alerts when we find great deals from your chosen airports." },
    { q: "Why do I need to become a member?", a: "Members get exclusive access to the best deals 3 hours before free users." },
    { q: "How do I know I'm getting the best deal?", a: "Our team manually verifies each deal to ensure it's truly exceptional value." },
    { q: "How do I cancel my subscription?", a: "You can cancel anytime from your account settings. No questions asked." }
  ]

  const membershipBenefits = [
    "Instant access to the Tom's Flight Club system, including email alerts and the dashboard",
    "Flight deals up to 90% off",
    "Frequent Alerts for the best flight deals",
    "Deals in over 100+ destinations",
    "Flights from your home airport",
    "Peak season & holiday flights",
    "Non-stop flights or short layovers",
    "Book deals 2 - 6 months ahead",
    "Direct booking through top-ranked airlines",
    "Daily support and guidance"
  ]

  const plans = [
    {
      id: '3months',
      name: '3 Months',
      price: '£7.99',
      period: '/month',
      total: '£23.97',
      savings: null,
      link: process.env.NODE_ENV === 'development' 
        ? process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS_TEST
        : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS
    },
    {
      id: 'yearly',
      name: '1 Year',
      price: '£4.99',
      period: '/month',
      total: '£59.99',
      savings: 'Save 37%',
      recommended: true,
      link: process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY_TEST
        : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY
    },
    {
      id: '6months',
      name: '6 Months',
      price: '£5.99',
      period: '/month',
      total: '£35.94',
      savings: 'Save 25%',
      link: process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS_TEST
        : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS
    }
  ]

  const handleCheckout = () => {
    const plan = plans.find(p => p.id === selectedPlan)
    if (plan && plan.link) {
      // Store email and airport in session for Stripe webhook
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkoutEmail', email)
        sessionStorage.setItem('checkoutAirport', selectedAirport)
      }
      // Redirect to Stripe payment link
      window.location.href = plan.link
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Limited time offer banner */}
      <div className="bg-red-600 text-white py-2 text-center">
        <p className="font-bold">
          Limited time offer
        </p>
        <p className="text-2xl font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </p>
        <p className="text-sm">
          {(() => {
            const plan = plans.find(p => p.id === selectedPlan)
            if (plan?.id === 'yearly') {
              return 'Monthly rate increasing from £4.99 to £7.49/month'
            } else if (plan?.id === '6months') {
              return 'Monthly rate increasing from £5.99 to £8.99/month'
            } else {
              return 'Monthly rate increasing from £7.99 to £11.99/month'
            }
          })()}
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Last Step!</h1>
        
        <p className="text-center text-gray-600 mb-8">
          Make a single payment and start your {plans.find(p => p.id === selectedPlan)?.name.toLowerCase()} membership.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column - Payment form */}
          <div>
            
            {/* Membership Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="font-bold mb-4">Membership Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email address:</span>
                  <span className="font-medium">{email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected location:</span>
                  <span className="font-medium">{selectedAirport || 'Not selected'}</span>
                </div>
              </div>
            </div>
            
            {/* Plan Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="font-bold mb-4">Choose Your Plan</h2>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`block relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-3 left-4 bg-primary text-white text-xs px-2 py-1 rounded">
                        BEST VALUE
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={selectedPlan === plan.id}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold">{plan.name}</div>
                          <div className="text-sm text-gray-600">
                            {plan.price}{plan.period} · {plan.total}
                          </div>
                        </div>
                      </div>
                      {plan.savings && (
                        <span className="text-green-600 font-semibold text-sm">
                          {plan.savings}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Submit button */}
            <Button 
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
              disabled={!email || !selectedAirport}
            >
              <Lock className="mr-2 h-5 w-5" />
              CONTINUE TO SECURE CHECKOUT
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            
            {/* Trust badges */}
            <div className="flex justify-center gap-4 mt-4">
              <Shield className="h-8 w-8 text-gray-400" />
              <Lock className="h-8 w-8 text-gray-400" />
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              You'll be redirected to Stripe's secure checkout page<br />
              By purchasing, you agree to our <Link href="#" className="text-primary">Membership Policy</Link>
            </p>
          </div>
          
          {/* Right column - Benefits */}
          <div>
            {/* 14-Day Guarantee */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-2">⭐ 14-Day Guarantee</h3>
              <p className="text-sm">
                Not satisfied? Get a full refund within 14 days. No questions asked.
              </p>
            </div>
            
            {/* Membership includes */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-bold mb-4">Membership includes:</h3>
              <ul className="space-y-2">
                {membershipBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Recent deals showcase */}
            <FunnelRecentDealsClient />
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-900 rounded-full" />
      </div>
    </div>
  )
}