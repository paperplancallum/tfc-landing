import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function UpgradeBanner() {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sparkles size={32} />
          <div>
            <h3 className="text-xl font-semibold mb-1">
              Unlock 6 More Deals Daily
            </h3>
            <p className="opacity-90">
              Premium members get 9 deals at 7 AM - 3 hours before free users!
            </p>
          </div>
        </div>
        <Link href="/join">
          <Button variant="secondary" size="lg">
            Upgrade to Premium
          </Button>
        </Link>
      </div>
    </div>
  )
}