'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const [message, setMessage] = useState('Processing authentication...')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        
        // Check for code in search params (OAuth flow)
        const code = searchParams.get('code')
        const type = searchParams.get('type')
        
        if (code) {
          // Handle OAuth code exchange
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code:', error)
            setMessage('Authentication failed')
            setTimeout(() => router.push('/auth/login'), 2000)
            return
          }
          
          // Check if this is a password reset flow
          if (type === 'recovery') {
            setMessage('Password reset verified! Redirecting...')
            setTimeout(() => {
              window.location.href = '/auth/reset-password'
            }, 500)
            return
          }
          
          setMessage('Login successful! Redirecting...')
          setTimeout(() => {
            window.location.href = '/deals'
          }, 500)
          return
        }
        
        // Get the hash fragment (magic link flow)
        const hashFragment = window.location.hash
        
        if (!hashFragment) {
          setMessage('No authentication data found')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        // Parse the hash fragment
        const params = new URLSearchParams(hashFragment.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          setMessage('Invalid authentication data')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        // Set the session manually
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error('Error setting session:', error)
          setMessage('Authentication failed')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }

        if (data.session) {
          setMessage('Login successful! Redirecting...')
          // Clear the hash from the URL
          window.history.replaceState(null, '', window.location.pathname)
          // Redirect to deals page with hard reload to update server components
          setTimeout(() => {
            window.location.href = '/deals'
          }, 500)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setMessage('An error occurred during authentication')
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-gray-700">{message}</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}