"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

const steps = [
  { id: 1, label: "Enter email" },
  { id: 2, label: "New password" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-7 flex items-center gap-0">
      {steps.map((step, idx) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isDone
                    ? "rgba(99,102,241,0.15)"
                    : isActive
                      ? "rgba(99,102,241,0.15)"
                      : "rgba(39,39,42,0.6)",
                  borderColor: isDone
                    ? "rgba(99,102,241,0.6)"
                    : isActive
                      ? "rgba(99,102,241,0.8)"
                      : "rgba(63,63,70,1)",
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium",
                  isDone && "text-indigo-400",
                  isActive && "text-indigo-300",
                  !isDone && !isActive && "text-zinc-600"
                )}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check size={11} strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <span>{step.id}</span>
                )}
              </motion.div>

              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide",
                  isActive ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className="relative mx-3 mb-4 h-px w-16">
                <div className="absolute inset-0 bg-zinc-800" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-indigo-500/50"
                  initial={{ width: "0%" }}
                  animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
