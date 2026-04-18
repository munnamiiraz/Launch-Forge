import { Skeleton } from "@/src/components/ui/skeleton";

export default function PrizesLoading() {
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

      <div className="flex flex-col gap-6 p-6">
        
        {/* Banner Skeleton */}
        <Skeleton className="h-[120px] w-full rounded-2xl border border-border/40" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
               <Skeleton className="h-5 w-48" />
               <Skeleton className="h-3 w-64 opacity-40" />
            </div>
            <Skeleton className="h-10 w-48 rounded-lg border border-border/40" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          
          <div className="flex flex-col gap-5">
            {/* Summary Pills */}
            <div className="grid grid-cols-3 gap-3">
               <Skeleton className="h-[78px] rounded-xl border border-border/40" />
               <Skeleton className="h-[78px] rounded-xl border border-border/40" />
               <Skeleton className="h-[78px] rounded-xl border border-border/40" />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
               <Skeleton className="h-9 w-64 rounded-lg" />
               <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Prize Cards */}
            <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => (
                 <Skeleton key={i} className="h-[140px] w-full rounded-2xl border border-border/40" />
               ))}
            </div>
          </div>

          {/* Preview Panel Skeleton */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4">
             <Skeleton className="h-[20px] w-32" />
             <Skeleton className="h-[500px] w-full rounded-2xl border border-border/40" />
          </div>
        </div>

      </div>
    </div>
  );
}
