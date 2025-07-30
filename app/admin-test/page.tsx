'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function AdminTestPage() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    setLoading(true)
    
    // Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      setError('Not authenticated: ' + authError?.message)
      setLoading(false)
      return
    }
    
    setAuthUser(user)
    
    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      setError('Database error: ' + userError.message)
    } else {
      setDbUser(userData)
    }
    
    setLoading(false)
  }

  const fixAdminAccess = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/emergency-fix')
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to fix admin access')
      } else {
        alert('Admin access fixed! Refreshing...')
        window.location.reload()
      }
    } catch (err) {
      setError('Error fixing admin access')
    }
    
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Access Test</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Auth User</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authUser, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Database User</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(dbUser, null, 2)}
          </pre>
          
          {dbUser && (
            <div className="mt-4">
              <p className="text-sm">
                <strong>Email:</strong> {dbUser.email}<br />
                <strong>Is Admin:</strong> {dbUser.is_admin ? 'Yes ✅' : 'No ❌'}<br />
                <strong>Plan:</strong> {dbUser.plan}
              </p>
            </div>
          )}
        </div>
        
        {authUser?.email === 'callum@paperplan.co' && !dbUser?.is_admin && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Fix Admin Access</h3>
            <p className="text-sm mb-4">
              You're logged in as callum@paperplan.co but don't have admin access. 
              Click below to fix this.
            </p>
            <Button onClick={fixAdminAccess} disabled={loading}>
              Fix Admin Access
            </Button>
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm">
            <strong>Can access /admin:</strong> {dbUser?.is_admin ? 'Yes ✅' : 'No ❌'}
          </p>
          {dbUser?.is_admin && (
            <a href="/admin" className="text-blue-600 hover:underline text-sm">
              Go to Admin Panel →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}