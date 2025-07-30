import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Test with service key
  let serviceKeyWorks = false
  let serviceKeyError = null
  
  if (serviceKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?select=count`,
        {
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
        }
      )
      
      if (response.ok) {
        serviceKeyWorks = true
      } else {
        serviceKeyError = `Status: ${response.status}`
      }
    } catch (error: any) {
      serviceKeyError = error.message
    }
  }
  
  // Test with anon key
  let anonKeyWorks = false
  let anonKeyError = null
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?select=count`,
      {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      }
    )
    
    if (response.ok) {
      anonKeyWorks = true
    } else {
      anonKeyError = `Status: ${response.status}`
    }
  } catch (error: any) {
    anonKeyError = error.message
  }
  
  return NextResponse.json({
    hasServiceKey: !!serviceKey,
    serviceKeyLength: serviceKey?.length,
    serviceKeyPrefix: serviceKey?.substring(0, 20) + '...',
    serviceKeyWorks,
    serviceKeyError,
    anonKeyWorks,
    anonKeyError,
    supabaseUrl,
  })
}