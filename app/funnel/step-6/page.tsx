'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'

export default function FunnelStep6() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      {/* Background image placeholder - Bali theme */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Last Month's Best Finds:
        </h2>
        
        <p className="text-lg md:text-xl mb-8 text-center max-w-2xl opacity-90">
          On 10th of September our Berlin customers received <span className="font-bold">BER's</span><br />
          <span className="font-bold">Bali</span> return flight deal for just <span className="font-bold">$294 USD</span>.
        </p>
        
        {/* Flight Deal Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mb-8 text-gray-900">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-red-600">Berlin - Denpasar Bali error fare ⚠️</h3>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-lg font-bold">Berlin <span className="text-gray-400">to</span> Denpasar</p>
              <p className="text-sm text-gray-600">via Doha</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">US$294</p>
              <p className="text-xs text-gray-500 line-through">from $1,540</p>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2">Selected flights</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Departing flight - Sun, 10 Nov</p>
                  <p className="text-gray-600">BER 11:05 - DPS 12:05<sup>+1</sup></p>
                  <p className="text-xs text-gray-500">1 stop in DOH • Qatar Airways • Economy</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Returning flight - Sun, 1 Dec</p>
                  <p className="text-gray-600">DPS 19:35 - BER 10:05<sup>+1</sup></p>
                  <p className="text-xs text-gray-500">1 stop in DOH • Qatar Airways • Economy</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2 bg-red-50 rounded-lg p-2">
            <Zap className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-600">Error fare - Book ASAP!</span>
          </div>
        </div>
        
        <p className="text-lg mb-8 text-center">
          Standard fare: <span className="font-bold">$1,350</span><br />
          <span className="text-yellow-400 font-bold text-xl">Savings: $1,056</span>
        </p>
        
        <Link href="/funnel/step-7">
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
            SET MY HOME AIRPORT <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
      </div>
    </div>
  )
}