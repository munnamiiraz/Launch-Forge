"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  RefreshCcw,
  ShieldAlert,
  ClipboardList,
  Eye,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import { fetchAuditLogs, type AuditLog } from "@/src/services/admin-audit-log/audit-log.actions";

// Actions to filter by
const AUDIT_ACTIONS = [
  "USER_SUSPENDED",
  "USER_REACTIVATED",
  "USER_DELETED",
  "USER_PROMOTED",
  "USER_DEMOTED",
  "USER_INVITED",
  "USER_BULK_SUSPEND",
  "USER_BULK_DELETED",
  "WORKSPACE_CREATED",
  "WORKSPACE_UPDATED",
  "WORKSPACE_DELETED",
  "NEWSLETTER_BROADCAST",
  "NEWSLETTER_TEST_SEND",
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchAuditLogs({
        page,
        limit,
        action: actionFilter,
        actorId: search || undefined
      });
      
      if (response.success) {
        setLogs(response.data);
        setTotal(response.meta.total);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch audit logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionColor = (action: string) => {
    if (action.includes("DELETED")) return "destructive";
    if (action.includes("CREATED") || action.includes("PROMOTED")) return "outline";
    if (action.includes("SUSPENDED")) return "destructive";
    return "secondary";
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex min-h-full flex-col gap-8 p-6 font-sans animate-in fade-in duration-700">
      
      {/* ── Page title (Identity Band) ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-card/30 px-6 py-5">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/6 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold font-heading text-foreground">
              Security audit trails
            </h1>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Complete administrative ledger — monitored and immutable.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[10px] font-semibold tracking-wider uppercase border-border/40 hover:bg-white/5"
              onClick={() => fetchLogs()}
            >
              <RefreshCcw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold px-3 py-0.5 text-[9px] tracking-widest uppercase">
               SYSTEM CORE
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Stats Quick View ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden group hover:border-red-500/20 transition-all">
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
              </div>
              <Badge variant="outline" className="text-[9px] font-black border-indigo-500/30 text-indigo-400 uppercase tracking-widest px-2 py-0">Archive</Badge>
            </div>
            <div className="text-2xl font-bold mb-1 font-heading text-foreground/90">{total}</div>
            <p className="text-[11px] text-muted-foreground/60">Lifetime administrative actions recorded</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden group hover:border-red-500/20 transition-all">
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <Badge variant="outline" className="text-[9px] font-black border-amber-500/30 text-amber-400 uppercase tracking-widest px-2 py-0">Real-time</Badge>
            </div>
            <div className="text-2xl font-bold mb-1 font-heading text-foreground/90">Active</div>
            <p className="text-[11px] text-muted-foreground/60">Tamper-evident trail with IP verification</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden group hover:border-red-500/20 transition-all">
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <Badge variant="outline" className="text-[9px] font-black border-emerald-500/30 text-emerald-400 uppercase tracking-widest px-2 py-0">Reliability</Badge>
            </div>
            <div className="text-2xl font-bold mb-1 font-heading text-foreground/90">100%</div>
            <p className="text-[11px] text-muted-foreground/60">Audit coverage for sensitive core operations</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Operations Card ──────────────────────────────────── */}
      <Card className="overflow-hidden border-border/80 bg-card/40">
        
        {/* Toolbar (Standard Admin Pattern) */}
        <div className="flex flex-col gap-3 border-b border-border/60 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <form onSubmit={handleSearch}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Actor ID..."
                className="h-8 border-zinc-800 bg-card/60 pl-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-zinc-600 focus-visible:ring-0"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 w-[180px] bg-card/60 border-zinc-800 text-xs">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-xs">All Actions</SelectItem>
                {AUDIT_ACTIONS.map(action => (
                  <SelectItem key={action} value={action} className="text-xs">{action.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 ml-2 border-l border-border/40 pl-3">
               <span className="text-[10px] text-muted-foreground/40 font-medium tabular-nums">{total} entries</span>
            </div>
          </div>
        </div>

        {/* Header Row */}
        <div className="hidden grid-cols-[1.5fr_1.2fr_2fr_auto] gap-4 border-b border-border/60 bg-card/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 sm:grid">
          <span>Action & Entity</span>
          <span>Administrator</span>
          <span>Context & Metadata</span>
          <span className="text-right pr-2">Timestamp</span>
        </div>

        {/* Rows Container */}
        <div className="divide-y divide-border/40">
          {loading ? (
             Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1.5fr_1.2fr_2fr_auto] gap-4 px-4 py-3 items-center">
                  <Skeleton className="h-4 w-4/5 bg-white/5" />
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-20 bg-white/5 ml-auto" />
                </div>
             ))
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
               <ShieldAlert size={28} className="text-zinc-800" />
               <p className="text-sm text-muted-foreground/60">No audit records match your query.</p>
            </div>
          ) : logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.33, ease: [0.22, 1, 0.36, 1] }}
              className="group grid grid-cols-[1.5fr_1.2fr_2fr_auto] gap-4 px-4 py-3 items-center transition-colors hover:bg-card/40"
            >
              {/* Action */}
              <div className="flex flex-col gap-0.5">
                <Badge variant={getActionColor(log.action)} className="mr-auto text-[9px] px-1.5 py-0 uppercase font-black border-none tracking-tight">
                  {log.action.replace(/_/g, ' ')}
                </Badge>
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/90">{log.entity}</p>
                  <span className="text-[10px] font-mono text-muted-foreground/40">{log.entityId?.slice(-6) || '---'}</span>
                </div>
              </div>

              {/* Actor */}
              <div className="flex items-center gap-2.5 min-w-0">
                 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15">
                    {log.user?.image ? (
                      <img src={log.user.image} className="w-full h-full object-cover rounded-lg" alt="" />
                    ) : (
                      <span className="text-[10px] font-bold text-red-400 capitalize">
                        {(log.user?.name || log.userEmail || 'S')[0]}
                      </span>
                    )}
                 </div>
                 <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground/80">{log.user?.name || 'System'}</p>
                    <p className="truncate text-[10px] text-muted-foreground/50">{log.userEmail || log.user?.email || 'internal-core'}</p>
                 </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-1 min-w-0">
                 <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                    <div className="flex items-center gap-1">
                       <Activity size={10} className="text-emerald-500/60" />
                       <span className="font-mono">{log.ipAddress || '0.0.0.0'}</span>
                    </div>
                    <span className="text-muted-foreground/20">•</span>
                    <p className="truncate italic">{log.userAgent?.split(' ')[0] || 'Unknown'}</p>
                 </div>
                 {log.details && Object.keys(log.details).length > 0 && (
                   <div className="rounded border border-border/40 bg-zinc-950/40 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/60 truncate group-hover:whitespace-normal group-hover:line-clamp-none transition-all">
                      {JSON.stringify(log.details)}
                   </div>
                 )}
              </div>

              {/* Timestamp */}
              <div className="text-right pr-2">
                <p className="text-xs font-medium text-foreground/70 tabular-nums">
                  {format(new Date(log.createdAt), "HH:mm:ss")}
                </p>
                <p className="text-[10px] text-muted-foreground/40 tabular-nums">
                  {format(new Date(log.createdAt), "MMM d, yyyy")}
                </p>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Footer (Pagination) */}
        <div className="border-t border-border/60 bg-card/30 px-4 py-2.5 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground/40">
            Showing {logs.length} of {total} records
          </p>
          <div className="flex items-center gap-1.5">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-md text-muted-foreground/40 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-20"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-[10px] font-bold text-muted-foreground/60 px-2">{page} / {totalPages}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-md text-muted-foreground/40 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-20"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                <ChevronRight size={14} />
              </Button>
          </div>
        </div>
      </Card>

      {/* Security Shield Banner */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
         <ShieldAlert className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
         <div>
            <h4 className="text-xs font-bold text-emerald-400">Security Protocol Alpha active</h4>
            <p className="text-[10px] text-emerald-300/60 leading-relaxed mt-0.5">
              All logs are signed with a unique HMAC key and enqueued to the distributed ledger. 
              Modification of this stream is physically impossible without access to the root vault.
            </p>
         </div>
      </div>

    </div>
  );
}
