import { NextRequest, NextResponse } from 'next/server'
import { WinBackService } from '@/lib/subscription/win-back-service'

export async function GET(request: NextRequest) {
  // Verify this is a cron job request (from Vercel)
  const authHeader = request.headers.get('authorization')
  const vercelCron = request.headers.get('x-vercel-cron')
  
  // Check both authorization methods
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}` || vercelCron === '1'
  
  if (!isAuthorized) {
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