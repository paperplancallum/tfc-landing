import { DealsList } from '@/components/deals-list'
import { DealsWithPagination } from '@/components/deals-with-pagination'

interface DealsContentProps {
  city: {
    id: string
    name: string
    iata_code: string
  }
  userPlan: string
  page: number
}

export async function DealsContent({ city, userPlan, page }: DealsContentProps) {
  const result = await DealsList({ city, userPlan, page })
  
  return (
    <DealsWithPagination
      dealsContent={result.deals}
      totalPages={result.totalPages}
      currentPage={result.currentPage}
      totalDeals={result.totalDeals}
    />
  )
}