import { NextRequest, NextResponse } from 'next/server'
import { WinBackService } from '@/lib/subscription/win-back-service'

export async function GET(request: NextRequest) {
  // Verify this is a cron job request (from Vercel)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const winBackService = new WinBackService()
    await winBackService.checkAndSendWinBackCampaigns()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Win-back campaigns processed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing win-back campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to process win-back campaigns' },
      { status: 500 }
    )
  }
}