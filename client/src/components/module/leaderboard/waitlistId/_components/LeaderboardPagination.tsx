"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn }     from "@/src/lib/utils";
import type { LeaderboardPaginationMeta } from "../_types";

interface LeaderboardPaginationProps {
  meta:     LeaderboardPaginationMeta;
  onPage:   (page: number) => void;
  disabled?: boolean;
}

export function LeaderboardPagination({
  meta, onPage, disabled,
}: LeaderboardPaginationProps) {
  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  /* Build visible page numbers with ellipsis */
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)           pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Range label */}
      <p className="text-xs text-muted-foreground/60">
        Showing <span className="font-semibold text-muted-foreground">{from}–{to}</span>{" "}
        of <span className="font-semibold text-muted-foreground">{total}</span> referrers
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPage(1)}
          disabled={disabled || page === 1}
          className="h-7 w-7 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-30"
        >
          <ChevronsLeft size={13} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPage(page - 1)}
          disabled={disabled || page === 1}
          className="h-7 w-7 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-30"
        >
          <ChevronLeft size={13} />
        </Button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground/40">…</span>
          ) : (
            <Button
              key={p}
              variant="ghost"
              size="icon"
              onClick={() => onPage(p as number)}
              disabled={disabled}
              className={cn(
                "h-7 w-7 rounded-md text-xs font-medium transition-all",
                p === page
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground/80",
              )}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPage(page + 1)}
          disabled={disabled || page === totalPages}
          className="h-7 w-7 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-30"
        >
          <ChevronRight size={13} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPage(totalPages)}
          disabled={disabled || page === totalPages}
          className="h-7 w-7 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground/80 disabled:opacity-30"
        >
          <ChevronsRight size={13} />
        </Button>
      </div>
    </div>
  );
}