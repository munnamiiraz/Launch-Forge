import { Skeleton } from "@/src/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-in fade-in duration-700">
      
      {/* Header Skeleton */}
      <div className="flex h-[116px] shrink-0 flex-col justify-center border-b border-border/60 bg-background/50 px-6 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 opacity-60" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-6">
        
        {/* Profile Section Skeleton */}
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/40 p-5">
            <div className="flex flex-col gap-6">
              
              {/* Avatar + Basic Info */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="flex flex-col gap-2">
                   <Skeleton className="h-5 w-32" />
                   <Skeleton className="h-4 w-48 opacity-60" />
                   <Skeleton className="h-2 w-24 opacity-30" />
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Form Fields - Row 1 */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                   <Skeleton className="h-3 w-20" />
                   <Skeleton className="h-10 w-full rounded-md border border-border/40" />
                </div>
                <div className="flex flex-col gap-2">
                   <Skeleton className="h-3 w-24" />
                   <Skeleton className="h-10 w-full rounded-md border border-border/40" />
                </div>
              </div>

              {/* Bio Field */}
              <div className="flex flex-col gap-2">
                 <Skeleton className="h-3 w-16" />
                 <Skeleton className="h-20 w-full rounded-md border border-border/40" />
              </div>

              {/* Form Fields - Row 2 */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                   <Skeleton className="h-3 w-20" />
                   <Skeleton className="h-10 w-full rounded-md border border-border/40" />
                </div>
                <div className="flex flex-col gap-2">
                   <Skeleton className="h-3 w-20" />
                   <Skeleton className="h-10 w-full rounded-md border border-border/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Security Card Skeleton */}
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/40 p-5">
             <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                   <Skeleton className="h-4 w-40" />
                   <Skeleton className="h-3 w-64 opacity-60" />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-4">
                   <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex flex-col gap-1">
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-3 w-48 opacity-40" />
                      </div>
                   </div>
                   <Skeleton className="h-8 w-32 rounded-md" />
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
