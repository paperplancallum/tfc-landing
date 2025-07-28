import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test the exact query from the deal page
    const { data: deals1, error: error1 } = await supabase
      .from('deals')
      .select('*')
      .eq('departure_airport', 'LHR')
      .ilike('destination_city', 'Barcelona%')
      .gte('found_at', '2025-07-28T00:00:00')
      .lte('found_at', '2025-07-28T23:59:59')
    
    // Try without date filter
    const { data: deals2 } = await supabase
      .from('deals')
      .select('*')
      .eq('departure_airport', 'LHR')
      .ilike('destination_city', 'Barcelona%')
    
    // Try with exact destination
    const { data: deals3 } = await supabase
      .from('deals')
      .select('*')
      .eq('departure_airport', 'LHR')
      .eq('destination_city', 'Barcelona')
    
    // Get all deals to see structure
    const { data: allDeals } = await supabase
      .from('deals')
      .select('*')
    
    return NextResponse.json({
      test1_with_date: {
        count: deals1?.length || 0,
        deals: deals1,
        error: error1
      },
      test2_no_date: {
        count: deals2?.length || 0,
        deals: deals2
      },
      test3_exact_destination: {
        count: deals3?.length || 0,
        deals: deals3
      },
      all_deals_structure: allDeals?.map(d => ({
        departure_airport: d.departure_airport,
        destination_city: d.destination_city,
        found_at: d.found_at
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}