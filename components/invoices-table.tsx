'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface InvoicesTableProps {
  userId: string
}

export function InvoicesTable({ userId }: InvoicesTableProps) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadInvoices()
  }, [])

  async function loadInvoices() {
    // In a real app, this would fetch from Stripe API
    // For now, we'll show a placeholder
    setLoading(false)
  }

  const downloadInvoice = (invoiceId: string) => {
    // In a real app, this would download from Stripe
    console.log('Download invoice:', invoiceId)
  }

  if (loading) {
    return <div>Loading invoices...</div>
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Billing History</h3>
        </div>
        
        {invoices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FileText className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No invoices yet</p>
            <p className="text-sm mt-1">Your invoices will appear here once you upgrade to premium</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Description</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {format(new Date(invoice.created), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm">{invoice.description}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => downloadInvoice(invoice.id)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}