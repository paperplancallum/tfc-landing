import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Mail className="mx-auto text-primary mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-2">
            Check your email
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Didn&apos;t receive the email? Check your spam folder or request a new one.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}