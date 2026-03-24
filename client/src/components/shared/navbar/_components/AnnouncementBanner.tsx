"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center justify-center gap-3 border-b border-indigo-500/20 bg-indigo-600/8 px-10 py-2.5 text-center">
            {/* Subtle gradient line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <Sparkles size={13} className="shrink-0 text-indigo-400" />

            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/90">LaunchForge Beta</span>
              {" "}is now live — get 6 months Pro free for early adopters.{" "}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-0.5 font-medium text-indigo-400 underline-offset-2 hover:underline"
              >
                Claim your spot <ArrowRight size={11} />
              </Link>
            </p>

            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Dismiss announcement"
              className="absolute right-3 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted/60 hover:text-muted-foreground"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
