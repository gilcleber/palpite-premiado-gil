
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      {/* Form fields skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <div className="md:col-span-2">
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
      
      {/* Team selection skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 mx-auto" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      
      {/* Submit button skeleton */}
      <Skeleton className="h-14 w-full max-w-md mx-auto" />
    </div>
  )
}

export { Skeleton, LoadingSkeleton }
