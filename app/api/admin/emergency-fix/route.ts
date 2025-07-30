import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        authError: authError?.message
      }, { status: 401 })
    }
    
    // Only allow callum@paperplan.co to use this endpoint
    if (user.email !== 'callum@paperplan.co') {
      return NextResponse.json({
        error: 'Unauthorized - This endpoint is only for callum@paperplan.co'
      }, { status: 403 })
    }
    
    // Use service role client to bypass RLS
    const supabaseServiceRole = await createClient()
    
    // First, check if user exists in users table
    const { data: existingUser, error: checkError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    let result
    
    if (!existingUser) {
      // User doesn't exist, create them
      const { data: newUser, error: insertError } = await supabaseServiceRole
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          is_admin: true,
          plan: 'free',
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        return NextResponse.json({
          error: 'Failed to create user',
          details: insertError
        }, { status: 500 })
      }
      
      result = { action: 'created', user: newUser }
    } else {
      // User exists, update them
      const { data: updatedUser, error: updateError } = await supabaseServiceRole
        .from('users')
        .update({
          is_admin: true,
          email: user.email // Ensure email is correct
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (updateError) {
        return NextResponse.json({
          error: 'Failed to update user',
          details: updateError
        }, { status: 500 })
      }
      
      result = { action: 'updated', user: updatedUser }
    }
    
    // Verify the fix worked
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      success: true,
      message: 'Admin access restored for callum@paperplan.co',
      result,
      verification: {
        user: verifyUser,
        error: verifyError?.message,
        isAdmin: verifyUser?.is_admin
      },
      authUser: {
        id: user.id,
        email: user.email
      }
    })
    
  } catch (error: any) {
    console.error('Emergency fix error:', error)
    return NextResponse.json({
      error: 'Emergency fix failed',
      details: error.message
    }, { status: 500 })
  }
}