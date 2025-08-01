'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AuthHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have an auth code in the URL (for password reset)
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    
    if (code && (pathname === '/' || pathname === '')) {
      // Redirect to auth callback with the code
      let callbackUrl = `/auth/callback?code=${code}`
      if (type) {
        callbackUrl += `&type=${type}`
      }
      // Use replace to avoid back button issues
      router.replace(callbackUrl)
      return
    }
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