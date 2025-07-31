'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, MapPin } from 'lucide-react'

interface Airport {
  id: string
  iata_code: string
  name: string
  city: string
  country: string
}

interface AirportSelectorProps {
  airports: Airport[]
}

export function AirportSelector({ airports }: AirportSelectorProps) {
  const [selectedAirport, setSelectedAirport] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find popular airports from the provided airports list
  const popularCities = ['London', 'Madrid', 'Paris', 'Lisbon', 'Dublin', 'Amsterdam', 'New York', 'Frankfurt']
  const popularAirports = popularCities
    .map(cityName => {
      const airport = airports.find(a => 
        a.city.toLowerCase().includes(cityName.toLowerCase()) ||
        a.name.toLowerCase().includes(cityName.toLowerCase())
      )
      return airport ? {
        code: airport.iata_code,
        city: airport.city,
        name: cityName // Display name for the button
      } : null
    })
    .filter(Boolean)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAirportSelect = (airport: Airport) => {
    const displayValue = `${airport.city} - ${airport.name} (${airport.iata_code})`
    setSelectedAirport(displayValue)
    setSearchValue(displayValue)
    setShowDropdown(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedAirport', displayValue)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    setShowDropdown(true)
    
    if (value.trim() === '') {
      setFilteredAirports(airports.slice(0, 20)) // Show first 20 when empty
    } else {
      const filtered = airports.filter(airport => 
        airport.city.toLowerCase().includes(value.toLowerCase()) ||
        airport.name.toLowerCase().includes(value.toLowerCase()) ||
        airport.iata_code.toLowerCase().includes(value.toLowerCase()) ||
        airport.country.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredAirports(filtered.slice(0, 20)) // Limit to 20 results
    }
  }

  const handleQuickSelect = (cityName: string, code: string) => {
    const airport = airports.find(a => 
      a.city.toLowerCase() === cityName.toLowerCase() && 
      a.iata_code === code
    )
    if (airport) {
      handleAirportSelect(airport)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">
        Start Getting Deals By<br />
        Choosing Your Home<br />
        Airport
      </h1>
      
      <p className="text-lg mb-8 text-center text-gray-600">
        We will send flight deals departing your<br />
        chosen airport.
      </p>
      
      {/* Popular airports */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600 mb-4">Most popular:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
          {popularAirports.map((airport) => (
            <button
              key={airport.code}
              onClick={() => handleQuickSelect(airport.city, airport.code)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedAirport.includes(airport.city)
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-primary'
              }`}
            >
              {airport.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search input with dropdown */}
      <div className="w-full max-w-md mb-8" ref={dropdownRef}>
        <p className="text-sm text-gray-600 mb-2">Set home airport:</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by city or airport name..."
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => {
              setShowDropdown(true)
              if (searchValue === '') {
                setFilteredAirports(airports.slice(0, 20))
              }
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          
          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredAirports.length > 0 ? (
                filteredAirports.map((airport) => (
                  <button
                    key={airport.id}
                    onClick={() => handleAirportSelect(airport)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {airport.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {airport.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-gray-700">
                        {airport.iata_code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {airport.country}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No airports found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {selectedAirport ? (
        <Link href="/funnel/step-8">
          <Button 
            size="lg" 
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
          >
            Confirm Home Airport
          </Button>
        </Link>
      ) : (
        <Button 
          size="lg" 
          className="bg-gray-300 text-gray-500 font-bold text-lg px-8 py-6 rounded-full shadow-lg cursor-not-allowed"
          disabled
        >
          Confirm Home Airport
        </Button>
      )}
      
      <p className="mt-4 text-sm text-gray-500">
        You can add more airports later
      </p>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-900 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
      </div>
    </div>
  )
}