import { Skeleton } from "@/components/ui/skeleton";

export function LocationsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Sidebar */}
        <div className="bg-card rounded-xl border p-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />

          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Location Tree Items */}
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Location Details Card */}
          <div className="bg-card rounded-xl border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4 sm:mb-6 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>

          {/* Items List Card */}
          <div className="bg-card rounded-xl border p-4 sm:p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
