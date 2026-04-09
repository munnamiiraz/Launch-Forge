"use client";

import { motion } from "framer-motion";
import { MapPin, Share2, UserCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

const ACTIVITIES = [
  { id: "1", type: "join",     name: "Sarah K.",   location: "San Francisco", time: "2m ago",  gradient: "from-indigo-500 to-violet-600" },
  { id: "2", type: "referral", name: "Marcus T.",  location: "London",        time: "7m ago",  gradient: "from-violet-500 to-purple-600", extra: "referred 3 people" },
  { id: "3", type: "join",     name: "Priya M.",   location: "Bangalore",     time: "14m ago", gradient: "from-emerald-500 to-teal-600" },
  { id: "4", type: "confirm",  name: "James L.",   location: "Berlin",        time: "28m ago", gradient: "from-cyan-500 to-blue-600" },
  { id: "5", type: "referral", name: "Sofia R.",   location: "Madrid",        time: "41m ago", gradient: "from-amber-500 to-orange-500", extra: "referred 1 person" },
  { id: "6", type: "join",     name: "Chen W.",    location: "Singapore",     time: "1h ago",  gradient: "from-rose-500 to-pink-600" },
];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; dot: string }> = {
  join:     { icon: <Zap       size={10} />, label: "Joined",    dot: "bg-indigo-500"  },
  referral: { icon: <Share2    size={10} />, label: "Referred",  dot: "bg-violet-500"  },
  confirm:  { icon: <UserCheck size={10} />, label: "Confirmed", dot: "bg-emerald-500" },
};

export function RecentActivityFeed() {
  return (
    <Card className="border-border/80 bg-card/40 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />

      <CardHeader className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground/90">Recent activity</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {ACTIVITIES.map((activity, i) => {
            const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.join;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3 px-5 py-3 hover:bg-card/30 transition-colors"
              >
                {/* Avatar with activity dot */}
                <div className="relative mt-0.5 shrink-0">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-bold text-white",
                      activity.gradient
                    )}
                  >
                    {activity.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-background text-white",
                      cfg.dot
                    )}
                  >
                    {cfg.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground/80">
                    {activity.name}
                    <span className="font-normal text-muted-foreground/80"> {cfg.label.toLowerCase()}</span>
                    {activity.extra && (
                      <span className="text-muted-foreground/60"> · {activity.extra}</span>
                    )}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <MapPin size={9} />
                    <span>{activity.location}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-border/60 px-5 py-3">
          <button className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
