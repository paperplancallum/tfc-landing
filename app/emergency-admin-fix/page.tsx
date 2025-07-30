'use client'

import { useState } from 'react'

export default function EmergencyAdminFixPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runFix = async () => {
    setLoading(true)
    try {
      // First check admin status
      const checkRes = await fetch('/api/check-admin')
      const checkData = await checkRes.json()
      
      // Then try emergency fix
      const fixRes = await fetch('/api/admin/emergency-fix')
      const fixData = await fixRes.json()
      
      setResult({
        checkStatus: checkData,
        fixResult: fixData,
        success: fixRes.ok
      })
    } catch (error: any) {
      setResult({
        error: error.message,
        success: false
      })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Emergency Admin Fix</h1>
      
      <div className="bg-yellow-50 p-4 rounded mb-6">
        <p className="text-sm">
          This page will attempt to fix admin access for callum@paperplan.co
        </p>
      </div>

      <button
        onClick={runFix}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Running Fix...' : 'Run Emergency Fix'}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.success && (
            <div className="mt-4 bg-green-50 p-4 rounded">
              <p>Fix successful! Now run the SQL migration and try accessing /admin again.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 border-t pt-8">
        <h2 className="text-lg font-semibold mb-4">Manual SQL Fix</h2>
        <p className="text-sm mb-4">Run this SQL in Supabase:</p>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
{`-- Simple direct fix
UPDATE users 
SET is_admin = true 
WHERE email = 'callum@paperplan.co';

-- Verify
SELECT id, email, is_admin 
FROM users 
WHERE email = 'callum@paperplan.co';`}
        </pre>
      </div>
    </div>
  )
}