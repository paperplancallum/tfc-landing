import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FunnelStep1() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
      {/* Background airplane wing image placeholder */}
      <div className="absolute inset-0 bg-black/20 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          Save Up To 90% On Flights
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl">
          Our members save £488+/ticket on average
        </p>
        
        <Link href="/funnel/step-2" prefetch={true}>
          <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all">
            HOW IT WORKS?
          </Button>
        </Link>
        
        <p className="absolute bottom-8 text-sm opacity-70">
          *based on customer survey conducted in August 2024
        </p>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white/40 rounded-full" />
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