'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export type CurrencyCode = 'GBP' | 'USD' | 'EUR'

interface Currency {
  code: CurrencyCode
  symbol: string
  flag: string
  name: string
}

const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'GBP' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'USD' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'EUR' },
]

interface CurrencySelectorProps {
  selectedCurrency: CurrencyCode
  onCurrencyChange: (currency: CurrencyCode) => void
  className?: string
}

export function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange,
  className = ''
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.currency-selector')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`currency-selector relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Select currency"
      >
        <span className="text-lg">{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              onClick={() => {
                onCurrencyChange(currency.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${
                currency.code === selectedCurrency ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-lg">{currency.flag}</span>
              <span className="font-medium">{currency.code}</span>
              {currency.code === selectedCurrency && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Utility function to detect default currency based on user location
export function getDefaultCurrency(): CurrencyCode {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferredCurrency')
    if (saved && ['GBP', 'USD', 'EUR'].includes(saved)) {
      return saved as CurrencyCode
    }
  }

  // Check timezone for rough location detection
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // US timezones
    if (timezone.includes('America')) {
      return 'USD'
    }
    
    // European timezones (excluding UK)
    if (timezone.includes('Europe') && !timezone.includes('London')) {
      return 'EUR'
    }
  } catch (e) {
    // Fallback if Intl API fails
  }

  // Default to GBP
  return 'GBP'
}

// Utility function to format price with currency
export function formatPrice(amount: string, currency: CurrencyCode): string {
  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || ''
  return `${symbol}${amount}`
}