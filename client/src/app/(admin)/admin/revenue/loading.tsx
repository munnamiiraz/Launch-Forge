import { Skeleton } from "@/src/components/ui/skeleton";

function SectionDividerSkeleton({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-muted/60" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">{title}</span>
        <Skeleton className="h-2.5 w-40 opacity-20" />
      </div>
      <div className="h-px flex-1 bg-muted/60" />
    </div>
  );
}

export default function RevenueLoading() {
  return (
    <div className="flex min-h-full flex-col gap-8 p-6 animate-in fade-in duration-700">
      
      {/* ── Page identity band ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-card/30 px-6 py-8">
        <div className="relative flex items-center gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-emerald-500/10" />
          <div className="flex flex-col gap-2.5 w-full max-w-lg">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────── */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[90px] w-full rounded-xl border border-border/40" />
          ))}
        </div>
      </section>

      {/* ── MRR waterfall ─────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDividerSkeleton title="MRR Trend" />
        <Skeleton className="h-[420px] w-full rounded-xl border border-border/40" />
      </section>

      {/* ── Plan revenue breakdown ────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDividerSkeleton title="Plan revenue" />
        <Skeleton className="h-[380px] w-full rounded-xl border border-border/40" />
      </section>

      {/* ── Churn analysis ────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDividerSkeleton title="Churn" />
        <Skeleton className="h-[320px] w-full rounded-xl border border-border/40" />
      </section>

      {/* ── Cohort LTV + geography ───────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionDividerSkeleton title="LTV & Geography" />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[450px] w-full rounded-xl border border-border/40" />
          <Skeleton className="h-[450px] w-full rounded-xl border border-emerald-500/10" />
        </div>
      </section>

      {/* ── Transactions ─────────────────────────────────── */}
      <section className="flex flex-col gap-4 mb-20">
        <SectionDividerSkeleton title="Transactions" />
        <div className="rounded-xl border border-border/40 overflow-hidden bg-card/10">
           <div className="h-12 border-b border-border/40 bg-muted/20 px-4 flex items-center gap-4">
              <Skeleton className="h-4 w-full" />
           </div>
           {[1,2,3,4,5,6,7,8,9,10].map(row => (
              <div key={row} className="p-4 border-b border-border/10 last:border-0 flex items-center gap-4">
                 <Skeleton className="h-4 w-full" />
              </div>
           ))}
        </div>
      </section>

    </div>
  );
}
