import { Skeleton } from "@/src/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-in fade-in duration-700">
      
      {/* Header Skeleton */}
      <div className="flex h-[116px] shrink-0 flex-col justify-center border-b border-border/60 bg-background/50 px-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 opacity-60" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
        
        {/* Current Plan Hero Skeleton */}
        <Skeleton className="h-[148px] w-full rounded-2xl border border-border/40" />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-muted/60" />
          <Skeleton className="h-3 w-32 opacity-30" />
          <div className="h-px flex-1 bg-muted/60" />
        </div>

        {/* Usage Gauges Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl border border-border/40" />
          ))}
        </div>

        {/* Plans Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-muted/60" />
          <Skeleton className="h-3 w-16 opacity-30" />
          <div className="h-px flex-1 bg-muted/60" />
        </div>

        {/* Plan Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[480px] rounded-2xl border border-border/40" />
          ))}
        </div>

      </div>
    </div>
  );
}
