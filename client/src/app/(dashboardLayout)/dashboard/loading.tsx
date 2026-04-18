import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-in fade-in duration-700">
      
      {/* ── Header Skeleton ──────────────────────────────── */}
      <div className="flex h-[116px] shrink-0 flex-col justify-center border-b border-border/60 bg-background/50 px-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 opacity-60" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6">
        
        {/* ── Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/40 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16" />
              <div className="flex flex-col gap-1.5 pt-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-20 opacity-40" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Chart Area ────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
          <Skeleton className="h-[420px] w-full rounded-2xl border border-border/40" />
          <Skeleton className="h-[420px] w-full rounded-2xl border border-border/40" />
        </div>

        {/* ── Table Area ──────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16 opacity-60" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
             <div className="h-12 border-b border-border/40 bg-muted/20 px-6 flex items-center gap-4">
                <Skeleton className="h-4 w-full" />
             </div>
             {[1,2,3,4,5].map(row => (
                <div key={row} className="p-6 border-b border-border/10 last:border-0 flex items-center gap-6">
                   <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                   <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32 opacity-40" />
                   </div>
                   <Skeleton className="h-4 w-24" />
                   <Skeleton className="h-4 w-16" />
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
