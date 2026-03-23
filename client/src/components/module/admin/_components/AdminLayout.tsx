"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, DollarSign, BarChart3,
  Settings, Shield, ChevronLeft, ChevronRight,
  Bell, LogOut,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button }  from "@/src/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { adminLogoutAction } from "@/src/services/auth/admin-logout.action";

const NAV = [
  { href: "/admin",          label: "Overview",  icon: LayoutDashboard },
  { href: "/admin/users",    label: "Users",     icon: Users           },
  { href: "/admin/revenue",  label: "Revenue",   icon: DollarSign      },
  { href: "/admin/analytics",label: "Analytics", icon: BarChart3       },
  { href: "/admin/settings", label: "Settings",  icon: Settings        },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-zinc-950">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 64 : 220 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-screen shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950 overflow-hidden"
        >
          {/* Accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-800/60 px-3">
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15">
                  <Shield size={13} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-black tracking-tight text-zinc-100">Admin</p>
                  <p className="text-[9px] text-zinc-600">LaunchForge HQ</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15">
                <Shield size={13} className="text-red-400" />
              </div>
            )}
            <Button
              variant="ghost" size="icon"
              onClick={() => setCollapsed((v) => !v)}
              className="h-6 w-6 rounded-md text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-400"
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
              const link = (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-150",
                    active
                      ? "bg-red-500/12 text-red-300"
                      : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon size={15} className={cn("shrink-0", active ? "text-red-400" : "text-zinc-600")} />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                  {!collapsed && active && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
                    {label}
                  </TooltipContent>
                </Tooltip>
              ) : link;
            })}
          </nav>

          {/* Back to dashboard */}
          {/* Removed: Owner dashboard link */}
        </motion.aside>

        {/* ── Main ─────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/85 px-5 backdrop-blur-xl">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">
              Admin Console
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300">
                <Bell size={14} />
              </Button>
              <div className="flex items-center gap-2 border-l border-zinc-800/60 pl-3">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs font-medium text-zinc-200">Admin</span>
                  <span className="text-[10px] text-zinc-500">admin@launchforge.io</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                  onClick={() => adminLogoutAction()}
                >
                  <LogOut size={14} />
                </Button>
                <Avatar className="h-7 w-7 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-[10px] font-black text-white">
                    A
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}