'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Mail, Phone, MapPin } from 'lucide-react'

interface ProfileFormProps {
  user: User
  profile: any
  homeCity: any
}

export function ProfileForm({ user, profile, homeCity }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [selectedCityId, setSelectedCityId] = useState(profile?.home_city_id || '')
  const [cities, setCities] = useState<any[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  // Load cities on mount
  useState(() => {
    loadCities()
  })

  async function loadCities() {
    // Get cities from cities table
    const { data: citiesData } = await supabase
      .from('cities')
      .select('*')
      .order('name')
    
    // Get unique departure cities from deals
    const { data: dealsData } = await supabase
      .from('deals')
      .select('departure_city, departure_airport')
      .not('departure_city', 'is', null)
    
    // Create a map to avoid duplicates
    const cityMap = new Map()
    
    // Add cities from cities table
    if (citiesData) {
      citiesData.forEach(city => {
        cityMap.set(city.name.toLowerCase(), {
          id: city.id,
          name: city.name,
          iata_code: city.iata_code
        })
      })
    }
    
    // Add departure cities from deals (if not already in map)
    if (dealsData) {
      const uniqueDepartureCities = [...new Set(dealsData.map(d => d.departure_city))]
      uniqueDepartureCities.forEach(cityName => {
        if (cityName && !cityMap.has(cityName.toLowerCase())) {
          // Create a pseudo-ID for cities not in the cities table
          // This allows them to be selected and saved as home_city_id
          const pseudoId = `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`
          cityMap.set(cityName.toLowerCase(), {
            id: pseudoId,
            name: cityName,
            iata_code: dealsData.find(d => d.departure_city === cityName)?.departure_airport || ''
          })
        }
      })
    }
    
    // Convert map to array and sort
    const allCities = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    setCities(allCities)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        home_city_id: selectedCityId || null,
      })
      .eq('id', user.id)

    if (!error) {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Home City</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select your home city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}