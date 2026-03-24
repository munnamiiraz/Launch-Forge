"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import type { BillingCycle } from "../_types";
import { YEARLY_DISCOUNT } from "../_lib/pricing-data";
import { cn } from "@/src/lib/utils";

interface PricingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function PricingToggle({ cycle, onChange }: PricingToggleProps) {
  const isYearly = cycle === "yearly";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4"
    >
      {/* Monthly label */}
      <Label
        htmlFor="billing-toggle"
        className={cn(
          "cursor-pointer text-sm font-medium transition-colors duration-200",
          !isYearly ? "text-foreground/90" : "text-muted-foreground/80"
        )}
      >
        Monthly
      </Label>

      {/* Switch */}
      <Switch
        id="billing-toggle"
        checked={isYearly}
        onCheckedChange={(v) => onChange(v ? "yearly" : "monthly")}
        className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-zinc-700"
      />

      {/* Yearly label + badge */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor="billing-toggle"
          className={cn(
            "cursor-pointer text-sm font-medium transition-colors duration-200",
            isYearly ? "text-foreground/90" : "text-muted-foreground/80"
          )}
        >
          Yearly
        </Label>

        <AnimatePresence>
          {isYearly && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge className="border-emerald-500/30 bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Save {YEARLY_DISCOUNT}%
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
