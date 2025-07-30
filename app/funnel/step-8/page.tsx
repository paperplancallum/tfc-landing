'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Star, Users } from 'lucide-react'

export default function FunnelStep8() {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const valid = emailRegex.test(value)
    setIsValid(valid)
    
    if (valid && typeof window !== 'undefined') {
      sessionStorage.setItem('userEmail', value)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">
          Where To Send Your<br />
          Deals?
        </h1>
        
        <p className="text-lg mb-8 text-center text-gray-600">
          We will send the best flight deals <span className="font-bold">straight<br />
          to your inbox.</span>
        </p>
        
        {/* Email input */}
        <div className="w-full max-w-md mb-6">
          <p className="text-sm text-gray-600 mb-2">Enter your best email below</p>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        
        {isValid ? (
          <Link href="/funnel/checkout">
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all mb-6"
            >
              Confirm Email Address
            </Button>
          </Link>
        ) : (
          <Button 
            size="lg" 
            className="bg-gray-300 text-gray-500 font-bold text-lg px-8 py-6 rounded-full shadow-lg cursor-not-allowed mb-6"
            disabled
          >
            Confirm Email Address
          </Button>
        )}
        
        {/* Trust indicator */}
        <div className="flex items-center gap-2 mb-8 text-gray-700">
          <Users className="h-5 w-5" />
          <span className="font-semibold">50+ people joined today!</span>
        </div>
        
        {/* Testimonial */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 italic mb-3">
            "Tom's Flight Club opens up travel opportunities for those<br />
            who might not have a big budget but wish to<br />
            explore the world."
          </p>
          <p className="text-sm text-gray-600 font-semibold">
            - TFC member
          </p>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="w-2 h-2 bg-gray-900 rounded-full" />
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
      </div>
    </div>
  )
}