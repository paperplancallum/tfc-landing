'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Test page for subscription lifecycle - REMOVE IN PRODUCTION
export default function SubscriptionTestPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)
  const [message, setMessage] = useState('')

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/status')
      const data = await res.json()
      setStatus(data)
      setMessage(res.ok ? 'Status fetched' : data.error)
    } catch (error) {
      setMessage('Error fetching status')
    }
    setLoading(false)
  }

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/history')
      const data = await res.json()
      setHistory(data)
      setMessage(res.ok ? 'History fetched' : data.error)
    } catch (error) {
      setMessage('Error fetching history')
    }
    setLoading(false)
  }

  const testCancellation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/cancel-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'too_expensive',
          feedback: 'Testing cancellation flow',
          otherReason: ''
        })
      })
      const data = await res.json()
      setMessage(res.ok ? 'Cancellation processed' : data.error)
      if (res.ok) fetchStatus()
    } catch (error) {
      setMessage('Error processing cancellation')
    }
    setLoading(false)
  }

  const testReactivation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setMessage(data.error || 'Error creating checkout session')
      }
    } catch (error) {
      setMessage('Error processing reactivation')
    }
    setLoading(false)
  }

  const testUpdatePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/update-payment', {
        method: 'POST'
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setMessage(data.error || 'Error creating payment update session')
      }
    } catch (error) {
      setMessage('Error updating payment')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Subscription Lifecycle Test Page</h1>
      
      {message && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
          {message}
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className="flex gap-4 flex-wrap">
          <Button onClick={fetchStatus} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Fetch Status
          </Button>
          <Button onClick={fetchHistory} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Fetch History
          </Button>
          <Button onClick={testCancellation} disabled={loading} variant="destructive">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Test Cancel
          </Button>
          <Button onClick={testReactivation} disabled={loading} variant="secondary">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Test Reactivate
          </Button>
          <Button onClick={testUpdatePayment} disabled={loading} variant="outline">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Update Payment
          </Button>
        </div>
      </div>

      {status && (
        <div className="border rounded-lg p-6 mb-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}

      {history && (
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Stats</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
                {JSON.stringify(history.stats, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Recent Events</h3>
              <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded max-h-64">
                {JSON.stringify(history.events, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}