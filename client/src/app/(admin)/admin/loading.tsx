import { Skeleton } from "@/src/components/ui/skeleton";

function SectionSkeleton({ title, items = 1, cols = 1 }: { title: string, items?: number, cols?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-muted/60" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">{title}</span>
          <Skeleton className="h-3 w-40 opacity-20" />
        </div>
        <div className="h-px flex-1 bg-muted/60" />
      </div>

      {/* Grid Content */}
      <div className={`grid gap-4 ${cols === 2 ? 'lg:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className={`${cols === 1 ? 'h-36' : 'h-[380px]'} w-full rounded-xl border border-border/40 bg-card/10`} />
        ))}
      </div>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col gap-10 p-6 animate-in fade-in duration-700">
      
      {/* ── Page title skeleton ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-6 min-h-[100px] flex items-center">
        <div className="flex flex-col gap-3 w-full">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            <Skeleton className="h-4 w-32" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      {/* ── Sections ────────────────────────────────────── */}
      <SectionSkeleton title="Platform KPIs" items={4} cols={1} />
      <SectionSkeleton title="Revenue & Growth" items={2} cols={2} />
      <SectionSkeleton title="Acquisition" items={2} cols={2} />
      <SectionSkeleton title="Operations" items={3} cols={3} />

      {/* Extra space for scrolling */}
      <div className="h-20" />
    </div>
  );
}
