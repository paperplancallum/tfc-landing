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
        
        // Check if this is explicitly a recovery flow
        const isRecoveryType = searchParams.get('type') === 'recovery'
        
        // For password reset, we need to handle the callback properly
        if (isRecoveryType) {
          console.log('Password recovery flow detected')
          
          // Check if we already have a session from the email link
          const { data: currentSession } = await supabase.auth.getSession()
          if (currentSession?.session) {
            console.log('Session exists, redirecting to reset password')
            setMessage('Password reset verified! Redirecting...')
            setTimeout(() => {
              window.location.href = '/auth/reset-password'
            }, 500)
            return
          }
        }
        
        // If that didn't work, check for code in search params (OAuth flow)
        const code = searchParams.get('code')
        const type = searchParams.get('type')
        
        console.log('Auth callback - code:', code?.substring(0, 10) + '...', 'type:', type)
        console.log('Full URL:', window.location.href)
        
        if (code) {
          // For PKCE flow, we need to use the proper exchange method
          // Check if we have the code verifier stored
          const codeVerifier = sessionStorage.getItem('code_verifier')
          
          let exchangeResult
          if (codeVerifier) {
            // Use PKCE flow
            exchangeResult = await supabase.auth.exchangeCodeForSession(code)
          } else {
            // Try without PKCE
            exchangeResult = await supabase.auth.exchangeCodeForSession(code)
          }
          
          const { error, data } = exchangeResult
          
          console.log('Exchange code result:', { error, session: !!data?.session })
          
          if (error) {
            console.error('Error exchanging code:', error)
            setMessage('Authentication failed')
            setTimeout(() => router.push('/auth/login'), 2000)
            return
          }
          
          // Check the current session to determine the flow type
          const { data: sessionData } = await supabase.auth.getSession()
          
          // For password reset, Supabase sets specific user metadata
          const user = sessionData?.session?.user
          const isPasswordReset = !!(
            type === 'recovery' || 
            user?.recovery_sent_at ||
            user?.app_metadata?.provider === 'email' &&
            user?.aud === 'authenticated' &&
            !user?.confirmed_at // Often unconfirmed for password reset
          )
          
          console.log('Session check:', {
            isPasswordReset,
            type,
            recovery_sent_at: user?.recovery_sent_at,
            provider: user?.app_metadata?.provider,
            aud: user?.aud,
            confirmed_at: user?.confirmed_at
          })
          
          // Check if this is a password reset flow
          if (isPasswordReset || type === 'recovery') {
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
        const hashType = params.get('type')

        console.log('Hash fragment params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: hashType
        })

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
          // Check if this is a password reset flow
          const isPasswordReset = hashType === 'recovery' || type === 'recovery'
          
          if (isPasswordReset) {
            setMessage('Password reset verified! Redirecting...')
            window.history.replaceState(null, '', window.location.pathname)
            setTimeout(() => {
              window.location.href = '/auth/reset-password'
            }, 500)
            return
          }
          
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