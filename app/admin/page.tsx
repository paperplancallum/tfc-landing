'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, User, Mail, CreditCard, Activity, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string
  plan: string
  created_at: string
  subscriptions: any[]
  stats: {
    subscriptionEvents: number
    emailsSent: number
    activeWinBackCampaigns: any[]
  }
}

interface DetailedUser {
  user: any
  subscriptions: any[]
  events: any[]
  emails: any[]
  winBackCampaigns: any[]
  analytics: any[]
}

interface Stats {
  overview: {
    totalUsers: number
    freeUsers: number
    premiumUsers: number
    activeSubscriptions: number
    monthlyRevenue: number
    currency: string
  }
  last30Days: {
    newSignups: number
    canceledSubscriptions: number
    emailsSent: number
    churnRate: string
  }
  winBackCampaigns: any
  recentEvents: any
}

export default function AdminPage() {
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<UserData[]>([])
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Try simple stats first
      let res = await fetch('/api/admin/stats-simple')
      let data = await res.json()
      
      // If that has an error, try the original stats
      if (data.error && !data.overview) {
        res = await fetch('/api/admin/stats')
        data = await res.json()
      }
      
      if (data.overview) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default stats so UI doesn't break
      setStats({
        overview: {
          totalUsers: 0,
          freeUsers: 0,
          premiumUsers: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          currency: 'GBP'
        },
        last30Days: {
          newSignups: 0,
          canceledSubscriptions: 0,
          emailsSent: 0,
          churnRate: '0%'
        }
      })
    }
  }

  const searchUsers = async () => {
    if (!searchEmail.trim()) return
    
    setLoading(true)
    try {
      // Try the simple endpoint first
      let res = await fetch(`/api/admin/users/search-simple?email=${encodeURIComponent(searchEmail)}`)
      let data = await res.json()
      
      // If that fails, try the original endpoint
      if (!res.ok) {
        res = await fetch(`/api/admin/users/search?email=${encodeURIComponent(searchEmail)}`)
        data = await res.json()
      }
      
      if (res.ok) {
        setSearchResults(data.users)
        if (data.users.length === 0) {
          setMessage({ type: 'info', text: 'No users found' })
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to search users' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching users' })
    }
    setLoading(false)
  }

  const loadUserDetails = async (userId: string) => {
    setLoading(true)
    setMessage({ type: '', text: '' }) // Clear any previous messages
    
    try {
      // Try the simpler details endpoint first
      let res = await fetch(`/api/admin/users/${userId}/details`)
      let data = await res.json()
      
      // If that fails, try the original endpoint
      if (!res.ok) {
        res = await fetch(`/api/admin/users/${userId}`)
        data = await res.json()
      }
      
      if (res.ok) {
        setSelectedUser(data)
      } else {
        setMessage({ type: 'error', text: data.error || 'User not found' })
        setSelectedUser(null)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading user details' })
      setSelectedUser(null)
    }
    setLoading(false)
  }


  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.overview.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.overview.freeUsers} free / {stats.overview.premiumUsers} premium
                </p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  £{stats.overview.monthlyRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.overview.activeSubscriptions} active subs
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Signups (30d)</p>
                <p className="text-2xl font-bold">{stats.last30Days.newSignups}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Churn: {stats.last30Days.churnRate}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emails Sent (30d)</p>
                <p className="text-2xl font-bold">{stats.last30Days.emailsSent}</p>
                <p className="text-xs text-gray-500 mt-1">
                  All campaigns
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* User Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">User Search</h2>
        <div className="flex gap-4">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Enter user email..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button onClick={searchUsers} disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  console.log('Loading details for user:', user.id, user)
                  loadUserDetails(user.id)
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-600">
                      {user.name || 'No name'} • {user.plan} plan • Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.plan === 'premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan}
                    </span>
                    {user.stats.activeWinBackCampaigns.length > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        {user.stats.activeWinBackCampaigns.length} active campaigns
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${
          message.type === 'error' ? 'bg-red-50 text-red-700' :
          message.type === 'success' ? 'bg-green-50 text-green-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {message.type === 'error' ? <AlertCircle className="h-5 w-5 mt-0.5" /> :
           message.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5" /> :
           <AlertCircle className="h-5 w-5 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* User Details */}
      {selectedUser && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Profile</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email:</dt>
                  <dd className="font-medium">{selectedUser.user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Name:</dt>
                  <dd>{selectedUser.user.name || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Plan:</dt>
                  <dd className={selectedUser.user.plan === 'premium' ? 'text-green-600 font-medium' : ''}>
                    {selectedUser.user.plan}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Joined:</dt>
                  <dd>{new Date(selectedUser.user.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

          </div>

          {/* Subscription History */}
          {selectedUser.subscriptions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Subscription History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Plan</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Period</th>
                      <th className="text-left py-2">Stripe ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.subscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b">
                        <td className="py-2">{sub.plan_name || sub.plan_id}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                            sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-2">
                          {sub.price_currency?.toUpperCase()} {(sub.price_amount / 100).toFixed(2)}
                        </td>
                        <td className="py-2">
                          {sub.current_period_start && new Date(sub.current_period_start).toLocaleDateString()} - 
                          {sub.current_period_end && new Date(sub.current_period_end).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-xs font-mono">
                          {sub.stripe_subscription_id?.substring(0, 20)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Events */}
          {selectedUser.events.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Recent Events</h3>
              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-1">
                  {selectedUser.events.slice(0, 20).map((event) => (
                    <div key={event.id} className="text-sm flex justify-between py-1 border-b">
                      <span>{event.event_type}</span>
                      <span className="text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}