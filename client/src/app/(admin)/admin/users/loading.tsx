import { Skeleton } from "@/src/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-700">
      
      {/* ── Page header ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-5">
        <div className="relative flex items-start gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-red-500/10" />
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl border border-red-500/5 bg-red-500/5" />
        ))}
      </div>

      {/* ── Full users table ──────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between gap-4 px-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
          <div className="h-12 border-b border-border/40 bg-muted/20 px-4 flex items-center gap-4">
             <Skeleton className="h-4 w-4" />
             <Skeleton className="h-4 w-32" />
             <Skeleton className="h-4 w-40" />
             <Skeleton className="h-4 w-24" />
          </div>
          <div className="divide-y divide-border/10">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3.5 w-64 opacity-50" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
