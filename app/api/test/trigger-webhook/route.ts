import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType = 'checkout.session.completed', customerEmail } = body

    if (!customerEmail) {
      return NextResponse.json({ error: 'customerEmail is required' }, { status: 400 })
    }

    // Call our webhook endpoint with a test event
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/stripe`
    
    // Create a mock Stripe event
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2024-12-18.acacia',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          object: 'checkout.session',
          customer: `cus_test_${Date.now()}`,
          customer_email: customerEmail,
          mode: 'subscription',
          payment_status: 'paid',
          status: 'complete',
          subscription: `sub_test_${Date.now()}`,
          metadata: {
            plan: 'premium_3mo'
          }
        }
      },
      livemode: false,
      type: eventType
    }

    // Note: This won't work with signature verification enabled
    // This is just for testing the webhook logic
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature' // This will fail signature check
      },
      body: JSON.stringify(mockEvent)
    })

    const result = await response.json()

    return NextResponse.json({
      message: 'Webhook test triggered',
      webhook_response: result,
      status: response.status,
      note: 'This will fail if webhook signature verification is enabled'
    })

  } catch (error: any) {
    console.error('Error triggering webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to trigger webhook' },
      { status: 500 }
    )
  }
}