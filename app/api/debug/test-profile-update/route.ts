import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { home_city_id } = await request.json()
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated', authError }, { status: 401 })
    }
    
    // First, let's check what cities are available
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name')
      .limit(5)
    
    // Check current user data
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Try to update just the home_city_id
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ home_city_id: home_city_id || null })
      .eq('id', user.id)
      .select()
      .single()
    
    // Get user data after update attempt
    const { data: afterUpdate, error: afterError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      success: !updateError,
      userId: user.id,
      userEmail: user.email,
      availableCities: cities,
      citiesError: citiesError?.message,
      currentUser,
      currentUserError: currentUserError?.message,
      updateResult,
      updateError: updateError ? {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      } : null,
      afterUpdate,
      afterError: afterError?.message,
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}