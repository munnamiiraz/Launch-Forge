"use client";

import { useState }     from "react";
import Link             from "next/link";
import { usePathname }  from "next/navigation";
import {
  Menu, X, Zap, Trophy, Share2, LayoutGrid,
  HelpCircle, LogOut, ChevronRight,
  Copy, Check, ExternalLink,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button }    from "@/src/components/ui/button";
import { Badge }     from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { cn }        from "@/src/lib/utils";
import type { SubscriberNavUser } from "../_types";

const GUEST_LINKS = [
  { label: "Browse waitlists", href: "/explore"     },
  { label: "How to earn",      href: "/how-to-earn" },
  { label: "Leaderboard",      href: "/leaderboard" },
  { label: "Prizes",           href: "/prizes"      },
];

const SUB_LINKS = [
  { label: "Leaderboard",      href: "",             icon: Trophy    },
  { label: "Browse waitlists", href: "/explore",     icon: LayoutGrid },
  { label: "How to earn",      href: "/how-to-earn", icon: Zap       },
  { label: "Help & FAQ",       href: "/how-to-earn#faq", icon: HelpCircle },
];

interface SubMobileMenuProps {
  isSubscriber: boolean;
  subscriber:   SubscriberNavUser | null;
}

export function SubMobileMenu({ isSubscriber, subscriber }: SubMobileMenuProps) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const close    = () => setOpen(false);

  const handleCopy = async () => {
    if (!subscriber) return;
    await navigator.clipboard.writeText(subscriber.inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    document.cookie = "subscriberToken=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
    close();
    window.location.href = "/explore";
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
            <Link href="/explore" onClick={close} className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15">
                <Zap size={13} className="text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-100">LaunchForge</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">

          {/* ── Subscriber block ──────────────────────────── */}
          {isSubscriber && subscriber && (
            <>
              {/* Identity card */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3">
                  <Avatar className="h-10 w-10 rounded-xl">
                    <AvatarFallback
                      className={cn(
                        "rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                        subscriber.avatarColor,
                      )}
                    >
                      {subscriber.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-zinc-100">
                      {subscriber.maskedName}
                    </span>
                    <span className="truncate text-[11px] text-zinc-500">
                      {subscriber.waitlist.name}
                    </span>
                  </div>
                </div>

                {/* Position + referral stats */}
                <div className="mt-2.5 flex items-center gap-2">
                  <Badge className="gap-1 rounded-full border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    <Trophy size={9} />
                    #{subscriber.position.toLocaleString()} in queue
                  </Badge>
                  <Badge className="gap-1 rounded-full border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <Share2 size={9} />
                    {subscriber.referralCount} referrals
                  </Badge>
                </div>

                {/* Copy invite link */}
                <button
                  onClick={handleCopy}
                  className={cn(
                    "mt-3 flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200",
                    copied
                      ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                      : "border-indigo-500/20 bg-indigo-500/8 text-indigo-300 hover:bg-indigo-500/12",
                  )}
                >
                  {copied
                    ? <Check  size={14} />
                    : <Copy   size={14} />
                  }
                  {copied ? "Invite link copied!" : "Copy my invite link"}
                  {!copied && (
                    <span className="ml-auto font-mono text-[10px] text-indigo-500">
                      {subscriber.referralCode}
                    </span>
                  )}
                </button>
              </div>

              <Separator className="bg-zinc-800/60" />

              {/* Subscriber nav links */}
              <nav className="flex flex-col gap-0.5 px-3 py-3">
                {SUB_LINKS.map((link) => {
                  const Icon   = link.icon;
                  const href   = link.href || `/w/${subscriber.waitlist.slug}/leaderboard`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={link.label}
                      href={href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-300"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                      )}
                    >
                      <Icon
                        size={15}
                        className={isActive ? "text-indigo-400" : "text-zinc-600"}
                      />
                      {link.label}
                      <ChevronRight size={13} className="ml-auto text-zinc-700" />
                    </Link>
                  );
                })}
              </nav>
            </>
          )}

          {/* ── Guest navigation ──────────────────────────── */}
          {!isSubscriber && (
            <nav className="flex flex-col gap-0.5 px-3 py-4">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Navigation
              </p>
              {GUEST_LINKS.map((link) => {
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
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
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

        {/* ── Footer ────────────────────────────────────── */}
        <div className="border-t border-zinc-800/60 p-4">
          {isSubscriber ? (
            <button
              onClick={handleLeave}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-red-500/8 hover:text-red-400"
            >
              <LogOut size={14} />
              Leave / clear session
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-center text-[11px] text-zinc-600">
                Join a waitlist to track your position
              </p>
              <Button
                asChild
                className="group relative w-full overflow-hidden bg-indigo-600 font-medium text-white hover:bg-indigo-500"
              >
                <Link href="/explore" onClick={close}>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  Browse waitlists
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}