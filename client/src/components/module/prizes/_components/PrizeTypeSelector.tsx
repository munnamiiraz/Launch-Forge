"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn }    from "@/src/lib/utils";
import { PRIZE_TYPE_META } from "../_types";
import type { PrizeType } from "../_types";

interface PrizeTypeSelectorProps {
  value:    PrizeType;
  onChange: (t: PrizeType) => void;
  disabled?: boolean;
}

const TYPES = Object.entries(PRIZE_TYPE_META) as [PrizeType, typeof PRIZE_TYPE_META[PrizeType]][];

export function PrizeTypeSelector({ value, onChange, disabled }: PrizeTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {TYPES.map(([type, meta], i) => {
        const selected = value === type;
        return (
          <motion.button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-200",
              selected
                ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm shadow-indigo-500/10"
                : "border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700/60 hover:bg-zinc-900/50",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {/* Check mark */}
            {selected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600"
              >
                <Check size={9} className="text-white" />
              </motion.span>
            )}

            <span className="text-xl">{meta.emoji}</span>

            <div>
              <p className={cn(
                "text-xs font-semibold transition-colors",
                selected ? "text-indigo-300" : "text-zinc-300",
              )}>
                {meta.label}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-zinc-600">
                {meta.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}