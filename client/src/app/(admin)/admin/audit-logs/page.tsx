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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import axios from "axios";

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

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: any;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image: string | null;
  } | null;
}

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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (actionFilter !== "all") params.append("action", actionFilter);
      if (search) params.append("actorId", search); // Simple search by ID/actor for now

      const response = await axios.get(`/api/admin/audit-logs?${params.toString()}`);
      
      if (response.data.success) {
        setLogs(response.data.data);
        setTotal(response.data.meta.total);
      }
    } catch (error: any) {
      toast.error("Failed to fetch audit logs");
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
    <div className="flex flex-col gap-8 p-6 lg:p-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
            System Audit Trails
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Monitor all high-privilege administrative actions across your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full px-4 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all"
            onClick={() => fetchLogs()}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-3 py-1 rounded-full text-sm font-medium">
             Security Level: Enterprise
          </Badge>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/2 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <ClipboardList className="w-6 h-6 text-indigo-400" />
              </div>
              <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">Lifetime Logs</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{total}</div>
            <p className="text-sm text-muted-foreground">Total administrative actions recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-white/2 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">Active Monitoring</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">Live</div>
            <p className="text-sm text-muted-foreground">Tamper-evident trail with IP & User-Agent</p>
          </CardContent>
        </Card>

        <Card className="bg-white/2 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">System Integrity</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">100%</div>
            <p className="text-sm text-muted-foreground">Audit coverage for sensitive endpoints</p>
          </CardContent>
        </Card>
      </div>

      {/* main Section */}
      <Card className="bg-white/2 border-white/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Action History</CardTitle>
              <CardDescription>Filtering and exploring system event logs.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Seach by Actor ID..." 
                  className="pl-9 bg-white/5 border-white/10 rounded-full focus:ring-indigo-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-56 bg-white/5 border-white/10 rounded-full">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="All Actions" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="all">All Actions</SelectItem>
                  {AUDIT_ACTIONS.map(a => (
                    <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/1">
                  <th className="py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Action & Entity</th>
                  <th className="py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Administrator</th>
                  <th className="py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">Context & Metadata</th>
                  <th className="py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-6 px-6"><Skeleton className="h-10 w-48 bg-white/5" /></td>
                      <td className="py-6 px-6"><Skeleton className="h-10 w-32 bg-white/5" /></td>
                      <td className="py-6 px-6"><Skeleton className="h-10 w-64 bg-white/5" /></td>
                      <td className="py-6 px-6 text-right"><Skeleton className="h-6 w-24 bg-white/5 ml-auto" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-white/5">
                           <ClipboardList className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-lg">No audit logs found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                      <td className="py-6 px-6">
                        <div className="flex flex-col gap-1.5">
                          <Badge variant={getActionColor(log.action)} className="mr-auto font-bold tracking-tight">
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-white/80">{log.entity}</span>
                            <span className="opacity-30">|</span>
                            <span className="font-mono text-xs opacity-50">{log.entityId?.slice(-8) || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold overflow-hidden shadow-lg shadow-indigo-500/10">
                            {log.user?.image ? (
                               <img src={log.user.image} alt={log.user.name} />
                            ) : (
                               <span>{log.user?.name.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white/90">{log.user?.name || 'System'}</span>
                            <span className="text-xs text-muted-foreground font-mono">{log.user?.email || log.userEmail || 'Internal Action'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col gap-2 max-w-xs">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-md px-2 py-1 w-fit">
                            <Activity className="w-3 h-3" />
                            <span>IP: {log.ipAddress || 'Internal'}</span>
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 opacity-60">
                            Agent: {log.userAgent || 'Unknown System'}
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                             <div className="mt-1 p-2 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono whitespace-pre-wrap text-emerald-400/80">
                               {JSON.stringify(log.details, null, 2)}
                             </div>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-medium text-white/90">{format(new Date(log.createdAt), "MMM d, yyyy")}</span>
                          <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                             {format(new Date(log.createdAt), "HH:mm:ss")}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {/* Footer with Pagination */}
        {logs.length > 0 && (
          <div className="py-4 px-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-white/90">{logs.length}</span> of <span className="font-bold text-white/90">{total}</span> events
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-8 h-8 border-white/10"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 mx-2">
                 <span className="text-sm font-medium">{page}</span>
                 <span className="text-sm text-muted-foreground">/</span>
                 <span className="text-sm text-muted-foreground">{totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-8 h-8 border-white/10"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Safety Message */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-indigo-500/20">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-indigo-400 font-semibold mb-1">Tamper-Proof Audit Logging</h4>
          <p className="text-xs text-indigo-300/70 leading-relaxed uppercase tracking-widest font-bold">
            All records are cryptographicaly linked and logged to an immutable table. 
            Modification or deletion of these logs is restricted to Database Super-Administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
