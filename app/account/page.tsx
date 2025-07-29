import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountTabs } from '@/components/account-tabs'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's home city
  let homeCity = null
  if (profile?.home_city_id) {
    // Check if it's a real UUID or a pseudo-ID
    if (profile.home_city_id.startsWith('city-')) {
      // It's a pseudo-ID, extract the city name
      const cityName = profile.home_city_id.replace('city-', '').replace(/-/g, ' ')
      // Find the city from deals
      const { data: dealCity } = await supabase
        .from('deals')
        .select('departure_city, departure_airport')
        .ilike('departure_city', cityName)
        .limit(1)
        .single()
      
      if (dealCity) {
        homeCity = {
          id: profile.home_city_id,
          name: dealCity.departure_city,
          iata_code: dealCity.departure_airport
        }
      }
    } else {
      // It's a real UUID from the cities table
      const { data: city } = await supabase
        .from('cities')
        .select('*')
        .eq('id', profile.home_city_id)
        .single()
      homeCity = city
    }
  }

  // Get subscription info
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <AccountTabs 
          user={user} 
          profile={profile} 
          subscription={subscription}
          homeCity={homeCity}
        />
      </div>
    </div>
  )
}