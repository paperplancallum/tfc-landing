'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, MapPin } from 'lucide-react'

export default function FunnelStep7() {
  const [selectedAirport, setSelectedAirport] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredAirports, setFilteredAirports] = useState<typeof allAirports>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const popularAirports = [
    { code: 'LHR', city: 'London', name: 'London' },
    { code: 'JFK', city: 'New York', name: 'New York' },
    { code: 'NRT', city: 'Tokyo', name: 'Tokyo' },
    { code: 'IST', city: 'Istanbul', name: 'Istanbul' },
    { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt' },
    { code: 'MAD', city: 'Madrid', name: 'Madrid' },
  ]

  // Extended list of airports for search
  const allAirports = [
    { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
    { code: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'United Kingdom' },
    { code: 'STN', city: 'London', name: 'Stansted Airport', country: 'United Kingdom' },
    { code: 'LCY', city: 'London', name: 'London City Airport', country: 'United Kingdom' },
    { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'USA' },
    { code: 'EWR', city: 'New York', name: 'Newark Liberty International', country: 'USA' },
    { code: 'LGA', city: 'New York', name: 'LaGuardia Airport', country: 'USA' },
    { code: 'NRT', city: 'Tokyo', name: 'Narita International', country: 'Japan' },
    { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
    { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
    { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
    { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas', country: 'Spain' },
    { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
    { code: 'ORY', city: 'Paris', name: 'Orly Airport', country: 'France' },
    { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
    { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino', country: 'Italy' },
    { code: 'BCN', city: 'Barcelona', name: 'Barcelona–El Prat', country: 'Spain' },
    { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
    { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
    { code: 'VIE', city: 'Vienna', name: 'Vienna International', country: 'Austria' },
    { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith', country: 'Australia' },
    { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
    { code: 'SIN', city: 'Singapore', name: 'Singapore Changi', country: 'Singapore' },
    { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'Hong Kong' },
    { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE' },
    { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'USA' },
    { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'USA' },
    { code: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'USA' },
    { code: 'ATL', city: 'Atlanta', name: 'Hartsfield–Jackson Atlanta', country: 'USA' },
    { code: 'MIA', city: 'Miami', name: 'Miami International', country: 'USA' },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAirportSelect = (airport: typeof allAirports[0]) => {
    const displayValue = `${airport.city} - ${airport.name} (${airport.code})`
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
      setFilteredAirports(allAirports.slice(0, 10)) // Show first 10 when empty
    } else {
      const filtered = allAirports.filter(airport => 
        airport.city.toLowerCase().includes(value.toLowerCase()) ||
        airport.name.toLowerCase().includes(value.toLowerCase()) ||
        airport.code.toLowerCase().includes(value.toLowerCase()) ||
        airport.country.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredAirports(filtered.slice(0, 10)) // Limit to 10 results
    }
  }

  const handleQuickSelect = (cityName: string) => {
    const airport = allAirports.find(a => a.city === cityName)
    if (airport) {
      handleAirportSelect(airport)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
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
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            {popularAirports.map((airport) => (
              <button
                key={airport.code}
                onClick={() => handleQuickSelect(airport.city)}
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
                  setFilteredAirports(allAirports.slice(0, 10))
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
            
            {/* Dropdown */}
            {showDropdown && filteredAirports.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredAirports.map((airport) => (
                  <button
                    key={airport.code}
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
                        {airport.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {airport.country}
                      </div>
                    </div>
                  </button>
                ))}
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
      </div>
      
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