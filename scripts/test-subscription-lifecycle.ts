#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { WinBackService } from '../lib/subscription/win-back-service'

// Run with: npx tsx scripts/test-subscription-lifecycle.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWinBackCampaign(email: string, campaignType: string) {
  console.log(`\n🧪 Testing win-back campaign: ${campaignType} for ${email}`)
  
  try {
    const winBackService = new WinBackService()
    const result = await winBackService.sendTestCampaign(email, campaignType)
    console.log('✅ Campaign sent successfully!')
    console.log('📧 Promo code:', result.discountCode)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function checkSubscriptionStatus(email: string) {
  console.log(`\n🔍 Checking subscription status for ${email}`)
  
  const { data: user } = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log('👤 User:', {
    id: user.id,
    email: user.email,
    plan: user.plan,
    stripeCustomerId: user.stripe_customer_id
  })
  
  if (user.subscriptions && user.subscriptions.length > 0) {
    console.log('📊 Subscriptions:')
    user.subscriptions.forEach((sub: any) => {
      console.log(`  - ${sub.status}: ${sub.plan_name} (${sub.price_currency} ${sub.price_amount/100})`)
      console.log(`    Period: ${sub.current_period_start} to ${sub.current_period_end}`)
    })
  }
}

async function simulateSubscriptionExpiration(email: string) {
  console.log(`\n⏰ Simulating subscription expiration for ${email}`)
  
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  // Update user to free plan
  await supabase
    .from('users')
    .update({ plan: 'free' })
    .eq('id', user.id)
  
  // Create expired subscription record
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      status: 'canceled',
      plan_id: 'premium_monthly',
      plan_name: 'Premium Monthly',
      price_amount: 499,
      price_currency: 'gbp',
      subscription_start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_end_date: yesterday.toISOString(),
      current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      current_period_end: yesterday.toISOString(),
    })
  
  console.log('✅ Subscription expired simulation complete')
}

async function listRecentEvents(email: string) {
  console.log(`\n📋 Recent events for ${email}`)
  
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  const { data: events } = await supabase
    .from('subscription_events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (events && events.length > 0) {
    events.forEach(event => {
      console.log(`  - ${event.created_at}: ${event.event_type}`)
      if (event.event_data) {
        console.log(`    Data:`, event.event_data)
      }
    })
  } else {
    console.log('  No events found')
  }
}

// Main test runner
async function main() {
  const command = process.argv[2]
  const email = process.argv[3]
  
  if (!command || !email) {
    console.log(`
Usage: npx tsx scripts/test-subscription-lifecycle.ts <command> <email>

Commands:
  status <email>              - Check subscription status
  expire <email>              - Simulate subscription expiration
  winback <email> <type>      - Send win-back campaign (day_3, day_7, day_14, day_30)
  events <email>              - List recent subscription events
  
Examples:
  npx tsx scripts/test-subscription-lifecycle.ts status test@example.com
  npx tsx scripts/test-subscription-lifecycle.ts winback test@example.com day_3
    `)
    process.exit(1)
  }
  
  switch (command) {
    case 'status':
      await checkSubscriptionStatus(email)
      break
      
    case 'expire':
      await simulateSubscriptionExpiration(email)
      break
      
    case 'winback':
      const campaignType = process.argv[4]
      if (!campaignType || !['day_3', 'day_7', 'day_14', 'day_30'].includes(campaignType)) {
        console.error('❌ Invalid campaign type. Use: day_3, day_7, day_14, or day_30')
        process.exit(1)
      }
      await testWinBackCampaign(email, campaignType)
      break
      
    case 'events':
      await listRecentEvents(email)
      break
      
    default:
      console.error(`❌ Unknown command: ${command}`)
      process.exit(1)
  }
  
  console.log('\n✅ Test complete!')
}

main().catch(console.error)