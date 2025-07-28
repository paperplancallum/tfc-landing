import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all deals ordered by created_at
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get count of all deals
    const { count } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      total_deals: count,
      latest_deals: deals?.map(d => ({
        id: d.id,
        departure_city: d.departure_city,
        destination_city: d.destination_city,
        departure_airport: d.departure_airport,
        destination_airport: d.destination_airport,
        price: d.price,
        currency: d.currency,
        is_premium: d.is_premium,
        created_at: d.created_at,
        found_at: d.found_at
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}