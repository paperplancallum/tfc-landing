'use client'

import { useState, useEffect } from 'react'
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
  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    // Only get cities from cities table - these are the curated home cities
    const { data: citiesData } = await supabase
      .from('cities')
      .select('*')
      .order('name')
    
    if (citiesData) {
      setCities(citiesData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Now that migration is applied, we can save pseudo-IDs directly
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        home_city_id: selectedCityId || null,
      }

      console.log('Updating profile with:', updateData)

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()

      console.log('Update response:', { data, error })

      if (error) throw error

      // Profile updated successfully
      console.log('Profile updated successfully')
      
      // Find the selected city to get its name for navigation
      const selectedCity = cities.find(c => c.id === selectedCityId)
      console.log('Found city:', selectedCity)
      
      if (selectedCity && selectedCityId) {
        // Navigate to the city-specific deals page
        const citySlug = selectedCity.name.toLowerCase().replace(/\s+/g, '-')
        console.log('Navigating to:', `/deals/${citySlug}`)
        window.location.href = `/deals/${citySlug}`
      } else {
        // Just refresh if no city selected
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
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