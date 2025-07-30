import { Skeleton } from '@/components/ui/skeleton'

export function RecentDealsSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="h-6 w-64 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-16 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}