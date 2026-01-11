import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  showCheckbox = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-lg border overflow-hidden', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            {showCheckbox && (
              <th className="w-12 px-4 py-3">
                <Skeleton className="h-4 w-4" />
              </th>
            )}
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {showCheckbox && (
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-4" />
                </td>
              )}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-4">
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ) : colIndex === 2 ? (
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-16" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
