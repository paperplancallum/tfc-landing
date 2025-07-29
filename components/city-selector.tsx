'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface City {
  id: string
  name: string
  iata_code: string
}

export function CitySelector() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCities()
  }, [])

  async function fetchCities() {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (!error && data) {
      setCities(data)
      // Default to London
      const london = data.find(city => city.iata_code === 'LON')
      if (london) {
        setSelectedCity(london.iata_code)
      }
    }
  }

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityCode = e.target.value
    setSelectedCity(cityCode)
    
    // Update user's home city if logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user && cityCode) {
      const selectedCityData = cities.find(c => c.iata_code === cityCode)
      if (selectedCityData) {
        await supabase
          .from('users')
          .update({ home_city_id: selectedCityData.id })
          .eq('id', user.id)
      }
    }
    
    const selectedCityData = cities.find(c => c.iata_code === cityCode)
    if (selectedCityData) {
      router.push(`/deals/${selectedCityData.name.toLowerCase().replace(/\s+/g, '-')}`)
    }
  }

  return (
    <div className="inline-flex items-center gap-4">
      <select
        value={selectedCity}
        onChange={handleCityChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
      >
        <option value="">Select a city</option>
        {cities.map((city) => (
          <option key={city.id} value={city.iata_code}>
            {city.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const selectedCityData = cities.find(c => c.iata_code === selectedCity)
          if (selectedCityData) {
            router.push(`/deals/${selectedCityData.name.toLowerCase().replace(/\s+/g, '-')}`)
          }
        }}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        disabled={!selectedCity}
      >
        View Deals
      </button>
    </div>
  )
}