import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user to verify auth is working
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Check if we can access the auth admin (this will fail without service role key)
    // but the error message might give us clues
    
    const debugInfo = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      currentUser: user?.email || 'Not authenticated',
      userError: userError?.message || null,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
      vercelUrl: process.env.VERCEL_URL || 'Not set',
      nodeEnv: process.env.NODE_ENV,
      possibleRedirectUrls: [
        'http://localhost:3000/auth/callback',
        'https://tfc-landing.vercel.app/auth/callback',
        'https://www.tomsflightclub.com/auth/callback',
        'https://tomsflightclub.com/auth/callback'
      ]
    }
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}