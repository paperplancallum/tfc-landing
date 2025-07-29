import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <h1 className="text-3xl font-bold mb-4">You've been unsubscribed</h1>
        <p className="text-gray-600 mb-8">
          You will no longer receive email digests from Tom's Flight Club. 
          You can always re-subscribe from your profile settings.
        </p>
        <div className="space-y-4">
          <Link href="/account">
            <Button variant="outline" className="w-full">
              Go to Account Settings
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}