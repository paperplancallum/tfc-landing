import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    // Use service role to bypass RLS
    const supabase = createServiceClient()
    
    // First, get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email')
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    // Get existing email preferences
    const { data: existingPrefs, error: prefsError } = await supabase
      .from('email_preferences')
      .select('user_id')
    
    if (prefsError) {
      console.error('Error fetching preferences:', prefsError)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }
    
    // Find users without preferences
    const usersWithPrefs = new Set(existingPrefs?.map(p => p.user_id) || [])
    const usersWithoutPrefs = allUsers?.filter(u => !usersWithPrefs.has(u.id)) || []
    
    console.log(`Found ${usersWithoutPrefs.length} users without email preferences`)
    
    // Create preferences for users who don't have them
    if (usersWithoutPrefs.length > 0) {
      const prefsToInsert = usersWithoutPrefs.map(user => ({
        user_id: user.id,
        email_frequency: 'daily',
        is_subscribed: true
      }))
      
      const { error: insertError } = await supabase
        .from('email_preferences')
        .insert(prefsToInsert)
      
      if (insertError) {
        console.error('Error inserting preferences:', insertError)
        return NextResponse.json({ 
          error: 'Failed to create preferences',
          details: insertError.message 
        }, { status: 500 })
      }
    }
    
    // Get updated stats
    const { data: stats } = await supabase
      .from('email_preferences')
      .select('email_frequency, is_subscribed')
    
    const summary = {
      totalUsers: allUsers?.length || 0,
      usersFixed: usersWithoutPrefs.length,
      totalWithPreferences: stats?.length || 0,
      subscribedUsers: stats?.filter(s => s.is_subscribed).length || 0,
      dailyUsers: stats?.filter(s => s.email_frequency === 'daily').length || 0,
      fixedUsers: usersWithoutPrefs.map(u => u.email)
    }
    
    return NextResponse.json({
      success: true,
      message: `Created email preferences for ${usersWithoutPrefs.length} users`,
      summary
    })
    
  } catch (error) {
    console.error('Error in fix-email-preferences:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}