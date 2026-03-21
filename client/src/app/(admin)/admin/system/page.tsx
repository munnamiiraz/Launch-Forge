import { type Metadata } from "next";
import { Activity } from "lucide-react";

import { ServiceHealthGrid } from "@/src/components/module/admin-system/_components/ServiceHealthGrid";
import { LatencyChart }      from "@/src/components/module/admin-system/_components/LatencyChart";
import { DatabaseStats }     from "@/src/components/module/admin-system/_components/DatabaseStats";
import { JobQueuePanel }     from "@/src/components/module/admin-system/_components/JobQueuePanel";
import { ErrorLogPanel, WebhookPanel, RateLimitPanel } from "@/src/components/module/admin-system/_components/SystemPanels";
import { ServerInfoCard }    from "@/src/components/module/admin-system/_components/ServerInfoCard";
import {
  getServiceHealth,
  getLatencyTimeSeries,
  getDbStats,
  getJobQueues,
  getErrorLog,
  getWebhookDeliveries,
  getRateLimits,
  getServerInfo,
} from "@/src/components/module/admin-system/_lib/system-data";

export const metadata: Metadata = {
  title:       "System — Admin · LaunchForge",
  description: "Live infrastructure health, database stats, job queues, error log, and webhooks.",
};

function Divider({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-800/60" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/70">{title}</span>
        {sub && <span className="text-[9px] text-zinc-700">{sub}</span>}
      </div>
      <div className="h-px flex-1 bg-zinc-800/60" />
    </div>
  );
}

export default async function AdminSystemPage() {
  // All data fetched in parallel — replace with real monitoring API / Prisma queries
  const [
    services, db, jobs, errors, webhooks, limits, server,
  ] = await Promise.all([
    getServiceHealth(),
    getDbStats(),
    getJobQueues(),
    getErrorLog(),
    getWebhookDeliveries(),
    getRateLimits(),
    getServerInfo(),
  ]);

  const degradedCount = services.filter((s) => s.status !== "operational").length;

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* ── Page identity band ───────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl border px-6 py-5 ${
        degradedCount > 0 ? "border-amber-500/20 bg-zinc-900/30" : "border-emerald-500/15 bg-zinc-900/30"
      }`}>
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/5 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            degradedCount > 0
              ? "border-amber-500/25 bg-amber-500/10"
              : "border-emerald-500/25 bg-emerald-500/10"
          }`}>
            <Activity size={18} className={degradedCount > 0 ? "text-amber-400" : "text-emerald-400"} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-100">
              System health
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Live infrastructure monitoring — services, API latency, database, background jobs,
              error log, webhook delivery, and rate limits. All reads are real-time from your infra APIs.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-600">
              {[
                `${services.length} services`,
                `${jobs.filter((j) => j.status === "running").length} jobs running`,
                `${errors.filter((e) => !e.resolved).length} unresolved errors`,
                `${webhooks.filter((w) => w.status === "failed").length} webhook failures`,
                `v${server.version}`,
              ].map((s) => (
                <span key={s} className="rounded-full border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Service health ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Service health" sub="API · Database · Stripe · Email · CDN · Storage" />
        <ServiceHealthGrid services={services} />
      </section>

      {/* ── API latency ──────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="API latency" sub="P50 / P95 / P99 response time — last 60 minutes" />
        <LatencyChart />
      </section>

      {/* ── Database ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Database" sub="PostgreSQL via Prisma — connections, cache, table sizes" />
        <DatabaseStats stats={db} />
      </section>

      {/* ── Background jobs ──────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Background jobs" sub="Worker queues — email, webhooks, referral sync, leaderboard, purge" />
        <JobQueuePanel jobs={jobs} />
      </section>

      {/* ── Error log ────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Error log" sub="Recent errors and warnings — mark resolved inline" />
        <ErrorLogPanel entries={errors} />
      </section>

      {/* ── Webhooks + rate limits ───────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Webhooks & rate limits" sub="Stripe delivery status and endpoint throttle monitor" />
        <div className="grid gap-4 lg:grid-cols-2">
          <WebhookPanel deliveries={webhooks} />
          <RateLimitPanel limits={limits} />
        </div>
      </section>

      {/* ── Server info ──────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <Divider title="Server" sub="Instance resources, Node.js version, deploy info" />
        <ServerInfoCard info={server} />
      </section>

    </div>
  );
}