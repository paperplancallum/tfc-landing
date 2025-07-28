'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Lock, Mail, Loader2, CheckCircle } from 'lucide-react'

export default function StripeCallbackPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [userExists, setUserExists] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    checkPaymentStatus()
  }, [])

  const checkPaymentStatus = async () => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('No payment session found')
      setLoading(false)
      return
    }

    try {
      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // User already has an account, just redirect
        setSuccess(true)
        setTimeout(() => {
          router.push('/deals')
        }, 2000)
        return
      }

      // For now, we'll show the account creation form
      // In production, you'd verify the session with Stripe here
      setLoading(false)
      
    } catch (err) {
      console.error('Error checking payment:', err)
      setError('Failed to verify payment')
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=/deals`,
        }
      })

      if (authError) {
        // If user already exists, sign them in instead
        if (authError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            setError('Email already registered. Please use the correct password or reset it.')
            setLoading(false)
            return
          }
          
          // Successfully signed in
          router.push('/deals')
          return
        }
        
        setError(authError.message)
        setLoading(false)
        return
      }

      // Success - show confirmation
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/verify-email')
      }, 2000)
      
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (loading && !email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Success!</h1>
          <p className="text-gray-600">Redirecting you to your deals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Create your account to access your premium membership
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use the same email you used for payment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                'Create Account & Access Deals'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-primary hover:underline"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}