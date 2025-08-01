import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CitySelector } from '@/components/city-selector'
import { Plane, Clock, Mail, CreditCard, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userHomeCity = null
  let userHomeCitySlug = ''
  
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('home_city_id')
      .eq('id', user.id)
      .single()
    
    if (userData?.home_city_id) {
      const { data: city } = await supabase
        .from('cities')
        .select('*')
        .eq('id', userData.home_city_id)
        .single()
      
      if (city) {
        userHomeCity = city
        userHomeCitySlug = city.name.toLowerCase().replace(/\s+/g, '-')
      }
    }
  }
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white">
        <div className="container py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Ultra-Cheap Flight Deals
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get personalized flight deals delivered to your inbox. Premium members get 9 deals daily at 7 AM, 3 hours before everyone else!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/deals">
              <Button size="lg" variant="secondary">
                Browse Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* City Selector */}
      <section className="py-12 bg-gray-50">
        <div className="container text-center">
          {userHomeCity ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Personalized Deals</h2>
              <div className="space-y-4">
                <Link href={`/deals/${userHomeCitySlug}`}>
                  <Button size="lg" className="inline-flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    View Deals from {userHomeCity.name}
                  </Button>
                </Link>
                <div>
                  <Link href="/account" className="text-sm text-gray-600 hover:text-gray-800 underline">
                    Change departure city
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Select Your Departure City</h2>
              <CitySelector />
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Tom's Flight Club?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Curated Deals</h3>
              <p className="text-gray-600">
                Hand-picked flight deals up to 75% off regular prices
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Early Access</h3>
              <p className="text-gray-600">
                Premium members get deals 3 hours before free users
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Daily Alerts</h3>
              <p className="text-gray-600">
                Personalized email digests based on your home city
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Flexible Plans</h3>
              <p className="text-gray-600">
                Choose from 3-month, 6-month, or yearly subscriptions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to Start Saving on Flights?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of travelers who save money on every trip
          </p>
          <Link href="/join">
            <Button size="lg">Start Your Free Trial</Button>
          </Link>
        </div>
      </section>
    </>
  )
}