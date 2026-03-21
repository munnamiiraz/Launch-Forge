"use client";

import { StepCard } from "./StepCard";
import { HOW_IT_WORKS_STEPS, STEP_ICONS } from "../_lib/steps-data";
import type { HowItWorksStep } from "../_types";

export function StepsGrid() {
  const steps: HowItWorksStep[] = HOW_IT_WORKS_STEPS.map((s, i) => ({
    ...s,
    icon: STEP_ICONS[i],
  }));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-5">
      {steps.map((step, index) => (
        <StepCard
          key={step.step}
          step={step}
          isLast={index === steps.length - 1}
          index={index}
        />
      ))}
    </div>
  );
}
