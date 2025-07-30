'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingDown } from 'lucide-react'

export default function FunnelStep5() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      {/* Background image placeholder - Bangkok theme */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Last Month's Best Finds:
        </h2>
        
        <p className="text-lg md:text-xl mb-8 text-center max-w-2xl opacity-90">
          On 12th of September our London customers received <span className="font-bold">LHR's</span><br />
          <span className="font-bold">Bangkok</span> return flight deal for just <span className="font-bold">$318 USD</span>.
        </p>
        
        {/* Flight Deal Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mb-8 text-gray-900">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Turkish Airlines promotion fare</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">LHR - Bangkok return</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Depart</p>
              <p className="font-bold">Wed, 05 Feb</p>
              <p className="text-sm text-gray-600">LHR 18:15</p>
              <p className="text-xs text-gray-500 mt-1">via Istanbul</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Return</p>
              <p className="font-bold">Sun, 16 Feb</p>
              <p className="text-sm text-gray-600">BKK 01:45</p>
              <p className="text-xs text-gray-500 mt-1">via Istanbul</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">FLASH SALE</span>
            </div>
            <div className="text-center bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-2xl font-bold text-green-600">$318.16</p>
            </div>
          </div>
        </div>
        
        <p className="text-lg mb-8 text-center">
          Standard fare: <span className="font-bold">$1,499</span><br />
          <span className="text-yellow-400 font-bold text-xl">Savings: $1,180</span>
        </p>
        
        <Link href="/funnel/step-6">
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
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
      </div>
    </div>
  )
}