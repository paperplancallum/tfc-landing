'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Mail, Phone, MapPin, Bell } from 'lucide-react'

interface ProfileFormProps {
  user: User
  profile: any
  homeCity: any
  isAdmin?: boolean
}

export function ProfileForm({ user, profile, homeCity, isAdmin = false }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [selectedCityId, setSelectedCityId] = useState(profile?.home_city_id || '')
  const [cities, setCities] = useState<any[]>([])
  const [emailFrequency, setEmailFrequency] = useState('daily')
  const [loadingPreferences, setLoadingPreferences] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Load cities and email preferences on mount
  useEffect(() => {
    loadCities()
    loadEmailPreferences()
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

  async function loadEmailPreferences() {
    try {
      const response = await fetch('/api/email/preferences')
      if (response.ok) {
        const data = await response.json()
        setEmailFrequency(data.email_frequency || 'daily')
      }
    } catch (error) {
      console.error('Error loading email preferences:', error)
    }
  }

  async function updateEmailPreferences(frequency: string) {
    setLoadingPreferences(true)
    try {
      const response = await fetch('/api/email/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_frequency: frequency,
          is_subscribed: frequency !== 'never'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }
      
      setEmailFrequency(frequency)
    } catch (error) {
      console.error('Error updating email preferences:', error)
      alert('Failed to update email preferences. Please try again.')
    } finally {
      setLoadingPreferences(false)
    }
  }

  async function sendTestEmail() {
    setSendingTestEmail(true)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }
      
      alert('Test email sent! Check your inbox.')
    } catch (error) {
      console.error('Error sending test email:', error)
      alert(error instanceof Error ? error.message : 'Failed to send test email. Please try again.')
    } finally {
      setSendingTestEmail(false)
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

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

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
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error?.message || error?.details || 'Failed to update profile. Please try again.'
      alert(errorMessage)
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

      <div>
        <label className="block text-sm font-medium mb-2">Email Notifications</label>
        <div className="relative">
          <Bell className="absolute left-3 top-3 text-gray-400" size={20} />
          <select
            value={emailFrequency}
            onChange={(e) => updateEmailPreferences(e.target.value)}
            disabled={loadingPreferences}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="three_weekly">Three times a week (Mon/Wed/Fri)</option>
            <option value="twice_weekly">Twice a week (Tue/Thu)</option>
            <option value="weekly">Weekly (Mondays)</option>
          </select>
        </div>
        {loadingPreferences && (
          <p className="text-sm text-gray-500 mt-1">Updating preferences...</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {isAdmin && (
          <Button 
            type="button" 
            onClick={sendTestEmail}
            disabled={sendingTestEmail || emailFrequency === 'never'}
            variant="outline"
          >
            {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
          </Button>
        )}
      </div>
    </form>
  )
}