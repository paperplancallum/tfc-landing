'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Pagination } from '@/components/ui/pagination'

interface AllDealsWithPaginationProps {
  dealsContent: React.ReactNode
  totalPages: number
  currentPage: number
  totalDeals: number
}

export function AllDealsWithPagination({ 
  dealsContent, 
  totalPages, 
  currentPage,
  totalDeals 
}: AllDealsWithPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const handlePageChange = (page: number) => {
    const url = new URL(pathname, window.location.origin)
    url.searchParams.set('page', page.toString())
    router.push(url.toString())
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const startItem = (currentPage - 1) * 9 + 1
  const endItem = Math.min(currentPage * 9, totalDeals)
  
  return (
    <>
      {totalDeals > 0 && (
        <p className="text-gray-600 mb-4">
          Showing {startItem}-{endItem} of {totalDeals} deals
        </p>
      )}
      
      {dealsContent}
      
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  )
}