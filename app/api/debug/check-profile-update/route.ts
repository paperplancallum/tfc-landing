import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { home_city_id } = await request.json()
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Check if city exists
    let cityCheck = null
    if (home_city_id) {
      const { data: city, error: cityError } = await supabase
        .from('cities')
        .select('*')
        .eq('id', home_city_id)
        .single()
      
      cityCheck = { city, error: cityError?.message }
    }
    
    // Try to update user
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ home_city_id: home_city_id || null })
      .eq('id', user.id)
      .select()
    
    // Get current user data
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      userId: user.id,
      home_city_id,
      cityCheck,
      updateResult,
      updateError: updateError?.message,
      currentUser,
      userError: userError?.message,
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error.message 
    }, { status: 500 })
  }
}