import { Skeleton } from "@/src/components/ui/skeleton";

export default function LeaderboardsLoading() {
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
        
        {/* Banner Block */}
        <Skeleton className="h-[92px] w-full rounded-2xl border border-border/40" />

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
           {[1, 2, 3, 4].map((i) => (
             <Skeleton key={i} className="h-[94px] w-full rounded-xl border border-border/40" />
           ))}
        </div>

        {/* Grid cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/40 p-5">
               <div className="flex flex-col gap-2 pb-4 border-b border-border/40">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-20 opacity-30" />
               </div>
               
               <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map(row => (
                    <div key={row} className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-4 opacity-20" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-3 w-24" />
                       </div>
                       <Skeleton className="h-3 w-8 opacity-40" />
                    </div>
                  ))}
               </div>

               <Skeleton className="mt-2 h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
