import { Skeleton } from "@/src/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-in fade-in duration-700">
      
      {/* Header Skeleton */}
      <div className="flex h-[116px] shrink-0 flex-col justify-center border-b border-border/60 bg-background/50 px-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56 opacity-60" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-6">
        
        {/* KPI Strip Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-48 opacity-60" />
          </div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[102px] w-full rounded-xl border border-border/40" />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-muted/60" />
          <Skeleton className="h-3 w-16 opacity-30" />
          <div className="h-px flex-1 bg-muted/60" />
        </div>

        {/* Chart Sections */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64 opacity-60" />
          </div>
          <Skeleton className="h-[380px] w-full rounded-2xl border border-border/40 bg-card/10" />
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-muted/60" />
          <Skeleton className="h-3 w-20 opacity-30" />
          <div className="h-px flex-1 bg-muted/60" />
        </div>

        <section className="flex flex-col gap-4">
           <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Skeleton className="h-[320px] rounded-2xl border border-border/40 bg-card/10" />
              <Skeleton className="h-[320px] rounded-2xl border border-border/40 bg-card/10" />
           </div>
           <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-[320px] rounded-2xl border border-border/40 bg-card/10" />
              <Skeleton className="h-[320px] rounded-2xl border border-border/40 bg-card/10" />
           </div>
        </section>

      </div>
    </div>
  );
}
