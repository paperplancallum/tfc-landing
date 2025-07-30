'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertCircle } from 'lucide-react'

export default function FunnelStep4() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      {/* Background image placeholder - Sydney/Dallas theme */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Last Month's Best Finds:
        </h2>
        
        <p className="text-lg md:text-xl mb-8 text-center max-w-2xl opacity-90">
          On 19th of September our Sydney customers received <span className="font-bold">SYD's</span><br />
          <span className="font-bold">Dallas</span> return flight deal for just <span className="font-bold">$264 USD</span>.
        </p>
        
        {/* Flight Deal Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mb-8 text-gray-900">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-red-600">Error Fiji Airlines fare Sydney (AUD) - Dallas (US) return</h3>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600 font-semibold">ERROR FARE</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-semibold">Departing flight - Thu, 13 Mar</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-600">SYD 18:00 - 22:20</p>
                  <span className="text-xs text-gray-500">30h 20m</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-semibold">Returning flight - Thu, 20 Mar</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-600">DFW 23:35 - 13:00<sup>+2</sup></p>
                  <span className="text-xs text-gray-500">19h 25m</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center bg-gray-100 rounded-lg p-3">
            <p className="text-3xl font-bold text-green-600">US$264</p>
          </div>
        </div>
        
        <p className="text-lg mb-8 text-center">
          Standard fare: <span className="font-bold">$1,350</span><br />
          <span className="text-yellow-400 font-bold text-xl">Savings: $1,086</span>
        </p>
        
        <Link href="/funnel/step-5">
          <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
            NEXT <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
      </div>
    </div>
  )
}