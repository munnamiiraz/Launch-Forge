"use client";

import { motion } from "framer-motion";
import { Download, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge }   from "@/src/components/ui/badge";
import { Button }  from "@/src/components/ui/button";
import { cn }      from "@/src/lib/utils";
import type { Invoice } from "@/src/components/module/billing/_types";

const STATUS_CONFIG = {
  paid:   { label: "Paid",   classes: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 size={10} /> },
  open:   { label: "Open",   classes: "border-amber-500/25 bg-amber-500/10 text-amber-400",       icon: <Clock        size={10} /> },
  failed: { label: "Failed", classes: "border-red-500/25 bg-red-500/10 text-red-400",             icon: <AlertCircle  size={10} /> },
  void:   { label: "Void",   classes: "border-zinc-700/60 bg-zinc-800/40 text-zinc-500",          icon: <AlertCircle  size={10} /> },
};

interface InvoiceHistoryProps {
  invoices: Invoice[];
}

export function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
  if (invoices.length === 0) {
    return (
      <Card className="border-zinc-800/80 bg-zinc-900/40">
        <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-200">Invoice history</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <FileText size={28} className="text-zinc-800" />
          <p className="text-sm text-zinc-600">No invoices yet</p>
          <p className="text-xs text-zinc-700">Your billing history will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Invoice history</p>
            <p className="text-[11px] text-zinc-600">All past payments and receipts</p>
          </div>
          <Badge className="border-zinc-700/60 bg-zinc-800/40 text-[10px] text-zinc-500">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      {/* Table header */}
      <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-zinc-800/60 bg-zinc-900/60 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 sm:grid">
        <span>Description</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Status</span>
      </div>

      <div className="divide-y divide-zinc-800/40">
        {invoices.map((inv, i) => {
          const cfg  = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.void;
          const date = new Date(inv.date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          });
          const sym  = inv.currency === "USD" ? "$" : inv.currency;

          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="group grid grid-cols-1 gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-900/40 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
            >
              {/* Description */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60">
                  <FileText size={13} className="text-zinc-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-300">{inv.description}</p>
                  <p className="text-[10px] text-zinc-700">#{inv.id}</p>
                </div>
              </div>

              {/* Date */}
              <span className="text-xs text-zinc-500">{date}</span>

              {/* Amount */}
              <span className="text-sm font-bold tabular-nums text-zinc-200">
                {sym}{inv.amount.toFixed(2)}
              </span>

              {/* Status + download */}
              <div className="flex items-center gap-2">
                <Badge className={cn("gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold", cfg.classes)}>
                  {cfg.icon}{cfg.label}
                </Badge>
                {inv.pdfUrl && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800/60 hover:text-zinc-300"
                  >
                    <a href={inv.pdfUrl} download>
                      <Download size={11} />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}