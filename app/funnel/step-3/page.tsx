'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function FunnelStep3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
      {/* Background image placeholder - Japan theme */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Last Month's Best Finds:
        </h2>
        
        <p className="text-lg md:text-xl mb-8 text-center max-w-2xl opacity-90">
          On 24th of August our NYC customers received EWR's<br />
          <span className="font-bold">Tokyo</span> return direct flight deal for just <span className="font-bold">$343 USD</span>.
        </p>
        
        {/* Flight Deal Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mb-8 text-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">New York - Tokyo</h3>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">RETURN</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-semibold">Outbound</p>
                <p className="text-gray-600">EWR 11:35</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Direct</p>
                <p className="text-xs text-gray-500">14h 20m</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">NRT</p>
                <p className="text-gray-600">15:55<sup>+1</sup></p>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-semibold">Inbound</p>
                <p className="text-gray-600">NRT 17:25</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Direct</p>
                <p className="text-xs text-gray-500">12h 40m</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">EWR</p>
                <p className="text-gray-600">16:05</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center bg-gray-100 rounded-lg p-3">
            <p className="text-3xl font-bold text-green-600">$343</p>
          </div>
        </div>
        
        <p className="text-lg mb-8 text-center">
          Standard fare: <span className="font-bold">$1,153</span><br />
          <span className="text-yellow-400 font-bold text-xl">Savings: $790</span>
        </p>
        
        <Link href="/funnel/step-4">
          <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
            NEXT <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
      </div>
    </div>
  )
}