import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WinBackService } from '@/lib/subscription/win-back-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { campaignType } = await request.json()
    
    if (!campaignType || !['day_3', 'day_7', 'day_14', 'day_30'].includes(campaignType)) {
      return NextResponse.json(
        { error: 'Invalid campaign type. Use: day_3, day_7, day_14, or day_30' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const userId = params.id
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Send win-back campaign
    const winBackService = new WinBackService()
    const result = await winBackService.sendTestCampaign(user.email, campaignType)
    
    // Log the event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'admin_sent_win_back',
        event_data: {
          campaign_type: campaignType,
          discount_code: result.discountCode,
          sent_by: 'admin'
        }
      })
    
    return NextResponse.json({
      success: true,
      message: `Win-back campaign (${campaignType}) sent successfully`,
      discountCode: result.discountCode
    })
  } catch (error) {
    console.error('Error sending win-back campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send win-back campaign' },
      { status: 500 }
    )
  }
}