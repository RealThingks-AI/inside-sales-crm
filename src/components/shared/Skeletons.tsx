import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export const TableSkeleton = ({
  columns = 6,
  rows = 5,
  className,
}: TableSkeletonProps) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex gap-4 p-3 border-b bg-muted/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton 
            key={`header-${i}`} 
            className="h-4 flex-1" 
            style={{ maxWidth: i === 0 ? 40 : undefined }}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="flex gap-4 p-3 border-b animate-pulse"
          style={{ animationDelay: `${rowIndex * 100}ms` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 flex-1"
              style={{ maxWidth: colIndex === 0 ? 40 : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton = ({ className }: CardSkeletonProps) => {
  return (
    <div className={cn("p-4 border rounded-lg space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
};

interface DashboardSkeletonProps {
  cards?: number;
}

export const DashboardSkeleton = ({ cards = 4 }: DashboardSkeletonProps) => {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border rounded-lg space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
