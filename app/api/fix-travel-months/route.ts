import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Update deals with missing travel_month
    const updates = [
      { 
        filter: { departure_city: 'London', destination_city: 'Barcelona', price: 49 },
        travel_month: 'February 2025'
      },
      { 
        filter: { departure_city: 'London', destination_city: 'Barcelona', price: 77 },
        travel_month: 'February 2025'
      },
      { 
        filter: { departure_city: 'London', destination_city: 'Rome, Italy' },
        travel_month: 'March 2025'
      },
      { 
        filter: { departure_city: 'London', destination_city: 'Amsterdam, Netherlands' },
        travel_month: 'February 2025'
      }
    ]
    
    const results = []
    
    for (const update of updates) {
      const { data, error } = await supabase
        .from('deals')
        .update({ travel_month: update.travel_month })
        .match(update.filter)
        .is('travel_month', null)
        .select()
      
      if (error) {
        results.push({ filter: update.filter, error: error.message })
      } else {
        results.push({ filter: update.filter, updated: data.length })
      }
    }
    
    // Update any remaining null travel_month values
    const { data: remaining, error: remainingError } = await supabase
      .from('deals')
      .update({ travel_month: 'March 2025' })
      .is('travel_month', null)
      .select()
    
    if (remainingError) {
      results.push({ filter: 'remaining nulls', error: remainingError.message })
    } else {
      results.push({ filter: 'remaining nulls', updated: remaining.length })
    }
    
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error updating travel months:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}