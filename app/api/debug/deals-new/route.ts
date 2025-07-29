import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all deals to see structure
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Check table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'deals' })
      .select('*')
    
    return NextResponse.json({
      total_deals: deals?.length || 0,
      deals: deals,
      table_info: {
        columns_query_error: columnsError?.message,
        sample_deal: deals?.[0] ? Object.keys(deals[0]) : null
      },
      debug_info: {
        first_deal_keys: deals?.[0] ? Object.keys(deals[0]) : null,
        has_new_fields: deals?.[0] ? {
          has_from_airport_code: 'from_airport_code' in deals[0],
          has_departure_airport: 'departure_airport' in deals[0],
          has_to_airport_code: 'to_airport_code' in deals[0],
          has_destination_city: 'destination_city' in deals[0]
        } : null
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}