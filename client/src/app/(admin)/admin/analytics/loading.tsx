import { Skeleton } from "@/src/components/ui/skeleton";

function DividerSkeleton({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-muted/60" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">{title}</span>
        <Skeleton className="h-2.5 w-48 opacity-20" />
      </div>
      <div className="h-px flex-1 bg-muted/60" />
    </div>
  );
}

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-8 p-6 animate-in fade-in duration-700">
      
      {/* ── Page identity band ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-5">
        <div className="relative flex items-start gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-red-500/10" />
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* ── Sections ────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <DividerSkeleton title="Engagement" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[350px] w-full rounded-xl border border-border/40" />
      </section>

      <section className="flex flex-col gap-4">
        <DividerSkeleton title="Feature adoption" />
        <Skeleton className="h-[300px] w-full rounded-xl border border-border/40" />
      </section>

      <section className="flex flex-col gap-4">
        <DividerSkeleton title="Subscriber & waitlist health" />
        <div className="grid gap-4 lg:grid-cols-2">
           <Skeleton className="h-[300px] w-full rounded-xl" />
           <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <DividerSkeleton title="Referral network" />
        <Skeleton className="h-[300px] w-full rounded-xl border border-border/40" />
      </section>

      <section className="flex flex-col gap-4">
        <DividerSkeleton title="Feedback & roadmap" />
        <div className="flex flex-col gap-4">
           <Skeleton className="h-[350px] w-full rounded-xl" />
           <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </section>

    </div>
  );
}
