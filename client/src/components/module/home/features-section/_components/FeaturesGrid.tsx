"use client";

import { FEATURES } from "../_lib/features-data";
import { HeroFeatureCard }    from "./HeroFeatureCard";
import { WideFeatureCard }    from "./WideFeatureCard";
import { DefaultFeatureCard } from "./DefaultFeatureCard";

export function FeaturesGrid() {
  const hero    = FEATURES.find((f) => f.size === "hero")!;
  const wide    = FEATURES.find((f) => f.size === "wide")!;
  const defaults = FEATURES.filter((f) => f.size === "default");

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 — hero card (full width) */}
      <HeroFeatureCard feature={hero} index={0} />

      {/* Row 2 — wide card (2-col) + first default card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Wide spans 2 cols */}
        <WideFeatureCard feature={wide} index={1} />

        {/* First default card fills the remaining col */}
        <DefaultFeatureCard feature={defaults[0]} index={2} />
      </div>

      {/* Row 3 — three default cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {defaults.slice(1).map((feature, i) => (
          <DefaultFeatureCard key={feature.id} feature={feature} index={i + 3} />
        ))}
      </div>
    </div>
  );
}
