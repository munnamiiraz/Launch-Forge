"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Zap,
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { PlanBadge } from "./PlanBadge";
import type { NavUser } from "../_types";
import { cn } from "@/src/lib/utils";

const PUBLIC_LINKS = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Explore", href: "/explore" },
  { label: "How to Earn", href: "/how-to-earn" },
];

const AUTH_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Waitlists", href: "/dashboard/waitlists", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing & Plan", href: "/dashboard/billing", icon: CreditCard },
];

interface MobileMenuProps {
  isAuthenticated: boolean;
  user: NavUser | null;
}

export function MobileMenu({ isAuthenticated, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    /**
     * import { authClient } from "@/lib/auth-client";
     * await authClient.signOut();
     */
    close();
    router.push("/login");
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 rounded-lg border border-zinc-800/60 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
          aria-label="Toggle menu"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-[300px] flex-col border-zinc-800/80 bg-zinc-950/98 p-0 backdrop-blur-xl sm:w-[340px]"
      >
        {/* Header */}
        <SheetHeader className="border-b border-zinc-800/60 px-5 py-4">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15">
                <Zap size={13} className="text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-100">
                LaunchForge
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* ── Authenticated user block ──────────────────── */}
          {isAuthenticated && user && (
            <>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3">
                  <Avatar className="h-10 w-10 rounded-xl">
                    <AvatarFallback
                      className={cn(
                        "rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                        user.avatarColor
                      )}
                    >
                      {user.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-zinc-100">
                      {user.name}
                    </span>
                    <span className="truncate text-[11px] text-zinc-500">
                      {user.email}
                    </span>
                  </div>
                  <PlanBadge plan={user.plan} />
                </div>
              </div>

              <Separator className="bg-zinc-800/60" />

              {/* Authenticated links */}
              <nav className="flex flex-col gap-0.5 px-3 py-3">
                {AUTH_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-300"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      )}
                    >
                      <Icon size={15} className={isActive ? "text-indigo-400" : "text-zinc-600"} />
                      {link.label}
                      <ChevronRight size={13} className="ml-auto text-zinc-700" />
                    </Link>
                  );
                })}
              </nav>

              {user.plan === "free" && (
                <div className="px-4 py-2">
                  <Link
                    href="/settings/billing"
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-3.5 py-2.5 text-sm text-indigo-300 transition-colors hover:bg-indigo-500/12"
                  >
                    <Sparkles size={14} className="text-indigo-400" />
                    Upgrade to Pro
                    <ArrowRight size={13} className="ml-auto" />
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ── Guest navigation ──────────────────────────── */}
          {!isAuthenticated && (
            <nav className="flex flex-col gap-0.5 px-3 py-4">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Navigation
              </p>
              {PUBLIC_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-800/60 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    {link.label}
                    <ChevronRight size={13} className="text-zinc-700" />
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── Footer CTA / sign-out ──────────────────────── */}
        <div className="border-t border-zinc-800/60 p-4">
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-red-500/8 hover:text-red-400"
            >
              <LogOut size={14} />
              Sign out
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="w-full border-zinc-800 bg-transparent text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                <Link href="/login" onClick={close}>Sign in</Link>
              </Button>
              <Button
                asChild
                className="group relative w-full overflow-hidden bg-indigo-600 font-medium text-white hover:bg-indigo-500"
              >
                <Link href="/register" onClick={close}>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  Get started free
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
