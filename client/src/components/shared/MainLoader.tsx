"use client";

import { motion } from "framer-motion";

/**
 * Premium, on-brand loading spinner for LaunchForge.
 *
 * Three concentric rings (indigo → violet → blue) spin at
 * different speeds in opposite directions. The core rocket icon
 * pulses softly. A subtle ambient glow ties it to the dark theme.
 *
 * Variants:
 *   size="sm"  → 40 px  (inline / button)
 *   size="md"  → 64 px  (card / section)
 *   size="lg"  → 88 px  (full-page, default)
 */

const SIZE_MAP = { sm: 40, md: 64, lg: 88 } as const;

interface MainLoaderProps {
  /** Visual size preset */
  size?: "sm" | "md" | "lg";
  /** Optional label shown beneath the spinner */
  label?: string;
}

export function MainLoader({ size = "lg", label }: MainLoaderProps) {
  const px = SIZE_MAP[size];
  const showLabel = size !== "sm";

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="relative" style={{ width: px, height: px }}>
        {/* ── Ambient glow ────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            transform: "scale(2.2)",
          }}
        />

        {/* ── Outer ring — slow clockwise ─────────────────────── */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            border: `${px > 50 ? 2 : 1.5}px solid transparent`,
            borderTopColor: "rgba(99,102,241,0.6)",    // indigo-500
            borderRightColor: "rgba(99,102,241,0.15)",
          }}
        />

        {/* ── Middle ring — medium counter-clockwise ──────────── */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{
            inset: px > 50 ? 8 : 5,
            border: `${px > 50 ? 2 : 1.5}px solid transparent`,
            borderTopColor: "rgba(139,92,246,0.55)",    // violet-500
            borderLeftColor: "rgba(139,92,246,0.12)",
          }}
        />

        {/* ── Inner ring — fast clockwise ─────────────────────── */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{
            inset: px > 50 ? 16 : 10,
            border: `${px > 50 ? 2 : 1.5}px solid transparent`,
            borderTopColor: "rgba(96,165,250,0.6)",     // blue-400
            borderBottomColor: "rgba(96,165,250,0.1)",
          }}
        />

        {/* ── Core dot — pulsing ──────────────────────────────── */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full bg-indigo-500"
          style={{
            width: px > 50 ? 6 : 4,
            height: px > 50 ? 6 : 4,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            boxShadow: "0 0 12px 3px rgba(99,102,241,0.4)",
          }}
        />
      </div>

      {/* ── Label ─────────────────────────────────────────────── */}
      {showLabel && (
        <div className="flex flex-col items-center gap-1.5">
          <motion.p
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-400/80"
          >
            {label || "Loading"}
          </motion.p>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="block h-1 w-1 rounded-full bg-indigo-400/60"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
