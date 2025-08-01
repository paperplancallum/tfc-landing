'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AuthHandlerSimple() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthRedirect = () => {
      // Check for error parameters first
      const error = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')
      
      if (error) {
        console.error('Auth error:', { error, errorCode, errorDescription })
        
        // Handle specific errors
        if (errorCode === 'otp_expired') {
          // Redirect to forgot password page with error message
          router.replace('/auth/forgot-password?error=expired')
          return
        }
        
        // For other errors, redirect to login
        router.replace('/auth/login?error=' + encodeURIComponent(errorDescription || error))
        return
      }
      
      // Check if we have a password reset token
      const token = searchParams.get('token')
      const email = searchParams.get('email')
      
      if (token && email && pathname === '/') {
        // This is a password reset link, redirect to the reset password page
        router.replace(`/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`)
        return
      }
    }
    
    handleAuthRedirect()
  }, [searchParams, router, pathname])

  return null
}