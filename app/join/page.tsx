import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FAQAccordion } from '@/components/faq-accordion'
import { TestimonialCarousel } from '@/components/testimonial-carousel'
import { createClient } from '@/lib/supabase/server'
import { PlanSelector } from '@/components/plan-selector'

const features = {
  premium: [
    'Unlimited Daily Deals',
    'Deals sent at 7am',
    { text: 'Deals are more recent and likely to be available still', highlight: true },
    'Priority customer support',
    'Cancel anytime',
  ],
  free: [
    '1 Daily Deal',
    'Deals sent at 10am',
    'Deals are more likely to be gone by the time you book',
    'Basic support',
    'Limited features',
  ],
}

export default async function JoinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user's current plan if logged in
  let userPlan = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
    userPlan = profile?.plan
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">
            {userPlan === 'premium' 
              ? 'You\'re Already a Premium Member!' 
              : 'Join Tom\'s Flight Club Premium'}
          </h1>
          <p className="text-xl mb-4">
            {userPlan === 'premium'
              ? 'Enjoy your exclusive access to the best flight deals'
              : 'Get exclusive access to the best flight deals before anyone else'}
          </p>
          {userPlan !== 'premium' && (
            <p className="text-lg bg-white/20 backdrop-blur px-4 py-2 rounded-full inline-block">
              🎉 Start with a <strong>3-day free trial</strong> - Cancel anytime
            </p>
          )}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Premium vs Free Membership
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Premium */}
              <div className="bg-white rounded-lg p-8 border-2 border-primary">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl font-bold text-primary">Premium</h3>
                  {userPlan === 'premium' && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      Your Plan
                    </span>
                  )}
                </div>
                <ul className="space-y-4">
                  {features.premium.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="text-green-500 mt-0.5" size={20} />
                      {typeof feature === 'string' ? (
                        <span>{feature}</span>
                      ) : (
                        <span className="bg-yellow-100 px-2 py-1 rounded font-semibold">
                          {feature.text}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Free */}
              <div className="bg-white rounded-lg p-8 border border-gray-300">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                  {userPlan === 'free' && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Your Plan
                    </span>
                  )}
                </div>
                <ul className="space-y-4">
                  {features.free.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <X className="text-gray-400 mt-0.5" size={20} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                {!user && (
                  <div className="mt-8">
                    <Link href="/auth/signup">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Sign Up for Free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Only show if not already premium */}
      {userPlan !== 'premium' && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-center text-gray-600 mb-12">
              All plans include a <strong>3-day free trial</strong>. No commitment, cancel anytime.
            </p>
            
            <PlanSelector />
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            What Our Members Say
          </h2>
          <TestimonialCarousel />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <FAQAccordion />
        </div>
      </section>
    </div>
  )
}