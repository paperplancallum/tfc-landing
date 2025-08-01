'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AuthHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCode = async () => {
      // Check if we have an auth code in the URL
      const code = searchParams.get('code')
      const type = searchParams.get('type')
      
      if (code && (pathname === '/' || pathname === '')) {
        // For password reset, we need to handle it directly here
        const supabase = createClient()
        
        try {
          // Try to exchange the code
          const { error, data } = await supabase.auth.exchangeCodeForSession(code)
          
          if (!error && data?.session) {
            console.log('Code exchanged successfully, checking if password reset...')
            
            // Check if this is a password reset by looking for recovery metadata
            const user = data.session.user
            const isPasswordReset = !!(
              type === 'recovery' ||
              user?.recovery_sent_at ||
              user?.app_metadata?.providers?.includes('email')
            )
            
            if (isPasswordReset) {
              console.log('Password reset detected, redirecting to reset-password page')
              router.replace('/auth/reset-password')
            } else {
              console.log('Regular login detected, redirecting to deals')
              router.replace('/deals')
            }
          } else {
            console.error('Failed to exchange code:', error)
            // Fallback to callback route
            let callbackUrl = `/auth/callback?code=${code}`
            if (type) {
              callbackUrl += `&type=${type}`
            }
            router.replace(callbackUrl)
          }
        } catch (err) {
          console.error('Error handling auth code:', err)
          // Fallback to callback route
          let callbackUrl = `/auth/callback?code=${code}`
          if (type) {
            callbackUrl += `&type=${type}`
          }
          router.replace(callbackUrl)
        }
      }
    }
    
    handleAuthCode()
  }, [searchParams, router, pathname])

  useEffect(() => {
    const supabase = createClient()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only handle specific navigation cases
      // Let login/callback pages handle their own redirects
      
      if (event === 'SIGNED_OUT') {
        // Refresh the page to update UI after sign out
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  return null
}