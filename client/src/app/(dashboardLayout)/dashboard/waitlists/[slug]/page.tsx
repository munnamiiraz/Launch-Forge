import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Lock, Settings, Users, Share2, BarChart3, TrendingUp, Calendar } from "lucide-react";

import { Badge }          from "@/src/components/ui/badge";
import { Button }         from "@/src/components/ui/button";
import { Separator }      from "@/src/components/ui/separator";
import { DashboardHeader } from "@/src/components/module/dashboard/_components/DashboardHeader";
import { fetchWaitlistInfo } from "@/src/services/leaderboard/leaderboard.action";
import { SubscriberGrowthChart } from "@/src/components/module/owners-analytics/_components/SubscriberGrowthChart";
import { ReferralFunnelChart } from "@/src/components/module/owners-analytics/_components/ReferralFunnelChart";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const info = await fetchWaitlistInfo(slug).catch(() => null);
  return {
    title:       `${info?.name ?? "Waitlist"} — LaunchForge`,
    description: `Manage and analyze ${info?.name ?? ""} performance.`,
  };
}

export default async function WaitlistDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const waitlist = await fetchWaitlistInfo(slug).catch(() => null);

  if (!waitlist) notFound();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <DashboardHeader
        title={waitlist.name}
        subtitle="Waitlist Details"
      >
        <div className="flex items-center gap-2">
          <Link href={`https://launchforge.app/${waitlist.slug}`} target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-zinc-200 dark:border-zinc-700/80 bg-transparent text-xs text-muted-foreground hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-muted/60 hover:text-foreground/90"
            >
              <ExternalLink size={12} />
              Public page
            </Button>
          </Link>
          <Button
            size="sm"
            className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Settings size={12} />
            Settings
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex flex-col gap-6 p-6">
        {/* Breadcrumb */}
        <Link
          href="/dashboard/waitlists"
          className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          <ArrowLeft size={13} />
          Back to list
        </Link>

        {/* Info card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 px-6 py-8">
           <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/25 bg-indigo-500/10">
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                       {waitlist.name.slice(0, 2).toUpperCase()}
                    </span>
                 </div>
                 <div>
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl font-black tracking-tight text-foreground">
                          {waitlist.name}
                       </h1>
                        <Badge
                           variant="outline"
                           className={
                             waitlist.isOpen
                               ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                               : "border-zinc-200 dark:border-zinc-700/60 bg-muted/40 text-muted-foreground/80"
                           }
                        >
                          {waitlist.isOpen
                            ? <><Globe size={10} className="mr-1.5" />Open</>
                            : <><Lock  size={10} className="mr-1.5" />Closed</>
                          }
                       </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground/80">
                       {waitlist.description || "No description provided."}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground/50">
                       <span className="flex items-center gap-1.5">
                           <Link href={`https://launchforge.app/${waitlist.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                             launchforge.app/{waitlist.slug}
                           </Link>
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground/50 uppercase tracking-wider font-semibold text-[10px]">Status</span>
                    <span className={waitlist.isOpen ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"}>{waitlist.isOpen ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground/50 uppercase tracking-wider font-semibold text-[10px]">Analytics</span>
                    <span className="text-foreground font-bold">7 Days</span>
                  </div>
              </div>
           </div>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-6 lg:grid-cols-3">
           {/* Detailed analytics page placeholder */}
           <div className="lg:col-span-2 space-y-6">
              <SubscriberGrowthChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ReferralFunnelChart />
              </div>
           </div>
           
           <div className="space-y-6">
              {/* Coming soon section */}
               <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-foreground">Recent Subscribers</h3>
                  <p className="text-xs text-muted-foreground/60 italic">Subscriber view coming soon...</p>
                  <Button variant="outline" size="sm" className="w-full text-[10px] border-zinc-200 dark:border-zinc-800" disabled>
                     View CRM
                  </Button>
               </div>

               <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card p-6 flex flex-col gap-4 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground">Quick Action</h3>
                  <Link href={`/dashboard/leaderboard/${waitlist.id}`}>
                     <Button variant="ghost" className="w-full justify-start gap-3 border border-zinc-200 dark:border-zinc-800 h-10 px-4 text-xs hover:bg-muted/60">
                        <TrendingUp size={14} className="text-amber-600 dark:text-amber-400" />
                        Manage Leaderboard
                     </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start gap-3 border border-zinc-200 dark:border-zinc-800 h-10 px-4 text-xs hover:bg-muted/60">
                     <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                     Manage Prizes
                  </Button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
