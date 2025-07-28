import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// WARNING: This endpoint clears all deals - use with caution!
const ADMIN_SECRET = process.env.DEALS_WEBHOOK_SECRET

export async function DELETE(request: Request) {
  try {
    // Check admin secret
    const authHeader = request.headers.get('x-webhook-secret')
    if (!ADMIN_SECRET || authHeader !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    
    // Delete all deals
    const { error, count } = await supabase
      .from('deals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all by using impossible ID
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error clearing deals:', error)
      return NextResponse.json(
        { error: 'Failed to clear deals', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${count || 0} deals from database` 
    })
  } catch (error) {
    console.error('Clear deals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to show usage
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/clear-deals',
    method: 'DELETE',
    authentication: 'X-Webhook-Secret header required',
    warning: 'This endpoint will delete ALL deals from the database!',
    usage: 'curl -X DELETE https://tfc-landing.vercel.app/api/clear-deals -H "X-Webhook-Secret: YOUR_SECRET"'
  })
}