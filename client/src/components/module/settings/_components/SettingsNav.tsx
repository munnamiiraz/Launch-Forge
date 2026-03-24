"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Building2, Bell, Shield, Settings,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const TABS = [
  { id: "profile",       label: "Profile",       icon: User        },
  { id: "workspace",     label: "Workspace",     icon: Building2   },
  { id: "notifications", label: "Notifications", icon: Bell        },
  { id: "security",      label: "Security",      icon: Shield      },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsNav() {
  const [active, setActive] = useState<TabId>("profile");

  /* Highlight tab based on scroll position */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as TabId);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    TABS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: TabId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="sticky top-20 hidden w-48 shrink-0 flex-col gap-1 lg:flex">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        Settings
      </p>
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-left",
              isActive ? "text-foreground" : "text-muted-foreground/80 hover:text-foreground/80",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="settings-nav-active"
                className="absolute inset-0 rounded-lg bg-zinc-800/80"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              size={14}
              className={cn("relative shrink-0", isActive ? "text-indigo-400" : "text-muted-foreground/60")}
            />
            <span className="relative">{label}</span>
            {isActive && (
              <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
}