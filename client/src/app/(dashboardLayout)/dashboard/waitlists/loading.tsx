import { Skeleton } from "@/src/components/ui/skeleton";

export default function WaitlistsLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-in fade-in duration-700">
      
      {/* Header Skeleton */}
      <div className="flex h-[116px] shrink-0 flex-col justify-center border-b border-border/60 bg-background/50 px-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 opacity-60" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6">
        
        {/* Controls Skeleton */}
        <div className="flex items-center justify-between">
           <Skeleton className="h-5 w-24 rounded-full" />
           <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* Grid cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/40 p-5">
              <div className="flex items-center justify-between">
                 <Skeleton className="h-5 w-20 rounded-full" />
                 <Skeleton className="h-4 w-4 opacity-20" />
              </div>
              <div className="flex flex-col gap-2">
                 <Skeleton className="h-5 w-40" />
                 <Skeleton className="h-3 w-56 opacity-40" />
              </div>
              <Skeleton className="h-2 w-32 opacity-20" />
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-2 w-12 opacity-30" />
                 </div>
                 <Skeleton className="h-3 w-16 opacity-30" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
