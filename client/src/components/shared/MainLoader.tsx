"use client";

import { motion } from "framer-motion";

/**
 * A sleek, modern loading component for the entire platform.
 * Uses Framer Motion for premium-feel animations.
 */
export function MainLoader() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-8">
      <div className="relative flex items-center justify-center">
        {/* Background Glow */}
        <div className="absolute -inset-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
        
        {/* Pulsing Outer Ring */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-20 w-20 rounded-full border border-primary/20 bg-linear-to-br from-primary/5 to-transparent"
        />
        
        {/* Spinning Gradient Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative h-12 w-12 rounded-full border-2 border-primary/10 border-t-primary"
        />

        {/* Logo/Core pulsing dot */}
        <motion.div 
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute h-2 w-2 rounded-full bg-primary"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <motion.h4
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs font-bold tracking-[0.2em] text-foreground uppercase"
        >
          Initialising
        </motion.h4>
        <div className="flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
