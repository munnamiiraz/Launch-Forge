"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Pencil, Trash2, XCircle, MoreHorizontal,
  Clock, CheckCircle2, DollarSign, Hash, AlertTriangle,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { Badge }   from "@/src/components/ui/badge";
import { Button }  from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { cn }     from "@/src/lib/utils";
import {
  PRIZE_TYPE_META, buildRankLabel, formatPrizeValue,
} from "@/src/components/module/prizes/_types";
import { deletePrizeAction, cancelPrizeAction } from "@/src/services/prizes/prizes.action";
import type { Prize } from "@/src/components/module/prizes/_types";

const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",    classes: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400", icon: <CheckCircle2 size={9} /> },
  AWARDED:   { label: "Awarded",   classes: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",       icon: <Trophy       size={9} /> },
  CANCELLED: { label: "Cancelled", classes: "border-zinc-200 dark:border-zinc-700 bg-muted/40 text-muted-foreground/80",          icon: <XCircle      size={9} /> },
};

interface PrizeCardProps {
  prize:    Prize;
  index:    number;
  onEdit:   (p: Prize) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
}

export function PrizeCard({ prize, index, onEdit, onDelete, onCancel }: PrizeCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isPending,     startTx]          = useTransition();

  const meta        = PRIZE_TYPE_META[prize.prizeType];
  const statusCfg   = STATUS_CONFIG[prize.status];
  const rankLabel   = buildRankLabel(prize.rankFrom, prize.rankTo);
  const prizeVal    = formatPrizeValue(prize);
  const isAwarded   = prize.status === "AWARDED";
  const isCancelled = prize.status === "CANCELLED";
  const isExpired   = prize.expiresAt ? new Date(prize.expiresAt) < new Date() : false;
  const isTop1      = prize.rankFrom === 1 && prize.rankTo === 1;

  const handleDelete = () => {
    startTx(async () => {
      await deletePrizeAction(prize.id, prize.waitlistId);
      onDelete(prize.id);
    });
  };

  const handleCancel = () => {
    startTx(async () => {
      await cancelPrizeAction(prize.id, prize.waitlistId);
      onCancel(prize.id);
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "border-border/80 bg-card/70 hover:bg-card/90",
          isTop1 && prize.status === "ACTIVE"
            ? "border-amber-500/30 shadow-md shadow-amber-500/5 hover:shadow-amber-500/10"
            : "",
          isCancelled ? "opacity-60" : "",
        )}>
          {/* Top bar */}
          <div className={cn(
            "h-0.5 w-full",
            prize.status === "ACTIVE"  && isTop1 ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" :
            prize.status === "ACTIVE"             ? "bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" :
            prize.status === "AWARDED"            ? "bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" :
                                                    "bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent",
          )} />

          <CardContent className="p-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Prize type emoji box */}
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl",
                  meta.accent,
                )}>
                  {meta.emoji}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {prize.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={cn("gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold", statusCfg.classes)}>
                      {statusCfg.icon}{statusCfg.label}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-200 dark:border-zinc-700/60 bg-zinc-100/50 dark:bg-zinc-800/30 px-2 py-0.5 text-[9px] text-muted-foreground/80">
                      {meta.label}
                    </Badge>
                    {isExpired && prize.status === "ACTIVE" && (
                      <Badge className="border-red-500/20 bg-red-500/5 px-2 py-0.5 text-[9px] text-red-600 dark:text-red-400">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isAwarded && !isCancelled && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className="h-7 w-7 shrink-0 rounded-md text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/60 hover:text-foreground/80"
                    >
                      <MoreHorizontal size={13} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 border-zinc-200 dark:border-zinc-800 bg-background/95 backdrop-blur-xl">
                    <DropdownMenuItem
                      onClick={() => onEdit(prize)}
                      className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60"
                    >
                      <Pencil size={12} />Edit prize
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-muted/60" />
                    <DropdownMenuItem
                      onClick={() => setConfirmCancel(true)}
                      className="cursor-pointer gap-2 text-xs text-amber-400 hover:bg-amber-500/8 focus:bg-amber-500/8 focus:text-amber-400"
                    >
                      <XCircle size={12} />Cancel prize
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setConfirmDelete(true)}
                      className="cursor-pointer gap-2 text-xs text-red-400 hover:bg-red-500/8 focus:bg-red-500/8 focus:text-red-400"
                    >
                      <Trash2 size={12} />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Separator className="my-4 bg-muted/60" />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Detail
                icon={<Hash size={11} className="text-muted-foreground/60" />}
                label="Rank range"
                value={rankLabel}
                highlight={isTop1}
              />
              {prizeVal && (
                <Detail
                  icon={<DollarSign size={11} className="text-muted-foreground/60" />}
                  label="Prize value"
                  value={prizeVal}
                  highlight
                />
              )}
              {prize.expiresAt && (
                <Detail
                  icon={<Clock size={11} className={isExpired ? "text-red-500" : "text-muted-foreground/60"} />}
                  label="Expires"
                  value={new Date(prize.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  danger={isExpired}
                />
              )}
              {prize.description && (
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-[11px] leading-relaxed text-muted-foreground/80">{prize.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete this prize?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/80">
              <strong className="text-foreground/80">{prize.title}</strong> will be permanently removed.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-muted-foreground hover:bg-muted/60">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-500">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirmation */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="border-zinc-200 dark:border-zinc-800 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle size={16} className="text-amber-400" />
              Cancel this prize?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/80">
              <strong className="text-foreground/80">{prize.title}</strong> will be cancelled and hidden
              from the public page. Participants will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-200 dark:border-zinc-800 bg-transparent text-muted-foreground hover:bg-muted/60">Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-amber-600 text-white hover:bg-amber-500">
              Cancel prize
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Detail({
  icon, label, value, highlight, danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
        {icon}
        {label}
      </div>
      <p className={cn(
        "text-sm font-bold tabular-nums",
        danger     ? "text-red-600 dark:text-red-400" :
        highlight  ? "text-foreground" :
                     "text-foreground/80",
      )}>
        {value}
      </p>
    </div>
  );
}