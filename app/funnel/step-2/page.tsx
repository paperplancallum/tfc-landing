import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FunnelStep2() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white relative overflow-hidden">
      {/* Background santorini-style image placeholder */}
      <div className="absolute inset-0 bg-black/30 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 max-w-3xl leading-tight">
          You Will Get Email Alerts With The Cheapest Flights
        </h1>
        
        <p className="text-lg md:text-xl mb-12 opacity-90 max-w-2xl">
          We monitor prices from your home airport to destinations worldwide. The moment a 
          great deal appears, we'll send it directly to your inbox.
        </p>
        
        <Link href="/funnel/step-3">
          <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-12 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
            NEXT
          </Button>
        </Link>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-white/40 rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
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