'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function PaymentSuccessContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    checkPaymentAndUser()
  }, [])

  const checkPaymentAndUser = async () => {
    try {
      // Get stored email and airport from session storage
      const storedEmail = sessionStorage.getItem('checkoutEmail') || ''
      const storedAirport = sessionStorage.getItem('checkoutAirport') || ''
      
      if (storedEmail) {
        setUserEmail(storedEmail)
      }

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Update user's plan to premium (in case webhook hasn't fired yet)
        console.log('Updating user plan for:', user.email)
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ plan: 'premium' })
          .eq('id', user.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating user plan:', updateError)
        } else {
          console.log('User plan updated successfully:', updatedUser)
        }
        
        setIsLoggedIn(true)
        // User is already logged in, redirect to deals
        setTimeout(() => {
          router.push('/deals')
        }, 2000)
      } else {
        // For new users coming from Stripe payment link
        // They need to create an account first
        setIsLoggedIn(false)
        
        if (storedEmail) {
          // If we have their email from the funnel, redirect to set password
          setTimeout(() => {
            router.push('/auth/set-password')
          }, 2000)
        } else {
          // Otherwise, they need to sign up
          setTimeout(() => {
            router.push('/auth/signup?plan=premium')
          }, 2000)
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error checking payment status:', err)
      setError('Something went wrong. Please contact support.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-lg text-gray-900">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/funnel/checkout">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-lg text-gray-900">
          Your purchase was successful, redirecting you to {isLoggedIn ? 'deals' : 'complete setup'}...
        </p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}