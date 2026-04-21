"use client";

import { useState } from "react";
import { Activity, Server, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface QueueMetrics {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface InfrastructureHealthProps {
  data: {
    queues: QueueMetrics[];
    totalWorkers: number;
    mode: string;
  };
}

export function InfrastructureHealth({ data }: InfrastructureHealthProps) {
  const [retrying, setRetrying] = useState<string | null>(null);

  if (!data?.queues) return null;

  const handleRetry = async (queueName: string) => {
    setRetrying(queueName);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/admin/analytics/infrastructure/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueName }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`Recovery successful: ${result.message}`);
      } else {
        toast.error("Recovery failed", { description: result.message });
      }
    } catch (err) {
      toast.error("Network error during recovery");
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-red-500/80">
          Infrastructure Vitals
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 gap-1.5 px-2 py-0.5 text-[10px]">
            <Activity size={10} className="animate-pulse" />
            Healthy
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 capitalize font-semibold py-0.5 text-[10px]">
            Mode: {data.mode}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.queues.map((queue, idx) => (
          <motion.div
            key={queue.name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden relative group">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/20 to-transparent" />
              
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold font-heading flex items-center gap-2">
                    <Server size={12} className="text-red-400" />
                    {queue.name}
                  </CardTitle>
                  
                  {queue.failed > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleRetry(queue.name)}
                      disabled={retrying === queue.name}
                    >
                      <RefreshCw size={10} className={retrying === queue.name ? "animate-spin" : ""} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pb-4">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/2 p-2 border border-white/5">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight">Active</p>
                    <p className="text-base font-bold text-blue-400">{queue.active}</p>
                  </div>
                  <div className="rounded-lg bg-white/2 p-2 border border-white/5">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight">Waiting</p>
                    <p className="text-base font-bold text-yellow-400">{queue.waiting}</p>
                  </div>
                </div>

                {/* Success/Fail Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-semibold uppercase text-muted-foreground tracking-wide">
                    <span>Performance</span>
                    <span className="text-foreground font-bold">
                      {Math.round((queue.completed / (queue.completed + queue.failed || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="flex h-1 w-full gap-0.5 rounded-full overflow-hidden bg-white/5">
                    <div 
                      className="h-full bg-green-500/40 transition-all duration-700" 
                      style={{ width: `${(queue.completed / (queue.completed + queue.failed || 1)) * 100}%` }} 
                    />
                    {queue.failed > 0 && (
                      <div 
                        className="h-full bg-red-500/50 transition-all duration-700" 
                        style={{ width: `${(queue.failed / (queue.completed + queue.failed || 1)) * 100}%` }} 
                      />
                    )}
                  </div>
                </div>

                {/* Throughput Row */}
                <div className="flex items-center justify-between px-2 bg-white/1 py-1.5 rounded border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight">Processed</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {queue.completed.toLocaleString()}
                  </span>
                </div>

                {/* Footer labels */}
                <div className="flex items-center justify-between pt-1 opacity-70">
                   <div className="flex items-center gap-1">
                      <Clock size={10} className="text-muted-foreground" />
                      <span className="text-[9px] font-medium">{queue.delayed} Delayed</span>
                   </div>
                   <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle size={10} />
                      <span className="text-[9px] font-bold">{queue.failed} Failed</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
