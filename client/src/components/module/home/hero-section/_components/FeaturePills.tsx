"use client";

import { motion } from "framer-motion";
import { Rocket, Share2, BarChart3, Sparkles, ShieldCheck } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

const features = [
  { icon: <Rocket size={11} />, label: "Viral referral loops" },
  { icon: <Share2 size={11} />, label: "One-click sharing" },
  { icon: <BarChart3 size={11} />, label: "Real-time analytics" },
  { icon: <Sparkles size={11} />, label: "AI-powered insights" },
  { icon: <ShieldCheck size={11} />, label: "GDPR compliant" },
];

export function FeaturePills() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap justify-center gap-2"
    >
      {features.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.7 + i * 0.06,
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Badge
            variant="outline"
            className="gap-1.5 border-zinc-800/80 bg-zinc-900/50 px-3 py-1.5 text-xs font-normal text-zinc-400 backdrop-blur-sm hover:border-zinc-700 hover:text-zinc-300 transition-colors cursor-default"
          >
            <span className="text-zinc-600">{f.icon}</span>
            {f.label}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
  );
}
