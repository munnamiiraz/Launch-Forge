"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

const FAQ_ITEMS = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes — you can upgrade or downgrade at any time via the billing portal. Upgrades take effect immediately and you're charged a prorated amount. Downgrades take effect at the end of your current billing period.",
  },
  {
    q: "What happens to my waitlists if I downgrade to Free?",
    a: "You'll keep all your existing waitlists and subscribers, but you won't be able to create new waitlists beyond the Free plan limit (1). Features like analytics, feedback boards, and prize management will be hidden until you re-upgrade.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on your first payment. For recurring payments, reach out to support within 7 days and we'll review case by case.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Invoices are available for annual Growth plan subscribers.",
  },
  {
    q: "Is my payment data secure?",
    a: "Yes — all payment processing is handled by Stripe. LaunchForge never stores your card details. Stripe is PCI-DSS Level 1 certified.",
  },
  {
    q: "How does the yearly billing discount work?",
    a: "Choosing yearly billing gives you a 20% discount compared to paying monthly. For Pro, that's $15/mo instead of $19/mo. For Growth, $39/mo instead of $49/mo. The full annual amount is charged at once.",
  },
];

export function BillingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/40">
      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <p className="text-sm font-semibold text-zinc-200">Frequently asked questions</p>
      </CardHeader>
      <CardContent className="divide-y divide-zinc-800/40 p-0">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-900/30"
            >
              <span className="text-sm font-medium text-zinc-300">{item.q}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 text-zinc-600 transition-transform duration-200",
                  open === i && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-zinc-800/40 bg-zinc-900/20 px-5 py-4 text-xs leading-relaxed text-zinc-500">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}