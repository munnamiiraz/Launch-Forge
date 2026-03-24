"use client";

import { useState } from "react";
import Link         from "next/link";
import {
  Trophy, Share2, LayoutGrid, HelpCircle,
  LogOut, Copy, Check, ChevronDown,
  ExternalLink, Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { cn }   from "@/src/lib/utils";
import type { SubscriberNavUser } from "../_types";

interface SubscriberMenuProps {
  subscriber: SubscriberNavUser;
}

export function SubscriberMenu({ subscriber }: SubscriberMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(subscriber.inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Queue position tier colour */
  const posBadgeClass =
    subscriber.position <= 10  ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
    subscriber.position <= 100 ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" :
                                  "border-zinc-700/60 bg-zinc-800/40 text-zinc-500";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/60">
          <Avatar className="h-6 w-6 rounded-md">
            <AvatarFallback
              className={cn(
                "rounded-md bg-gradient-to-br text-[9px] font-black text-white",
                subscriber.avatarColor,
              )}
            >
              {subscriber.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[100px] truncate text-xs font-medium text-zinc-300 sm:block">
            {subscriber.maskedName}
          </span>
          <ChevronDown
            size={12}
            className="text-zinc-600 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 border-zinc-800/80 bg-zinc-950/98 p-1.5 backdrop-blur-xl"
      >
        {/* Identity header */}
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarFallback
                className={cn(
                  "rounded-xl bg-gradient-to-br text-xs font-black text-white",
                  subscriber.avatarColor,
                )}
              >
                {subscriber.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-100">
                {subscriber.maskedName}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {subscriber.waitlist.name}
              </p>
            </div>
          </div>

          {/* Position + referral count badges */}
          <div className="mt-2.5 flex items-center gap-2">
            <Badge className={cn("gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", posBadgeClass)}>
              <Trophy size={9} />
              #{subscriber.position.toLocaleString()} in queue
            </Badge>
            <Badge className="gap-1 rounded-full border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <Share2 size={9} />
              {subscriber.referralCount} referrals
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-zinc-800/60" />

        {/* Copy invite link */}
        <DropdownMenuItem
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200 focus:bg-zinc-800/60"
        >
          {copied
            ? <Check size={13} className="text-emerald-400" />
            : <Copy  size={13} className="text-zinc-600" />
          }
          <span className={copied ? "text-emerald-400" : ""}>
            {copied ? "Invite link copied!" : "Copy my invite link"}
          </span>
          {!copied && (
            <span className="ml-auto rounded border border-zinc-800/60 bg-zinc-900/60 px-1 py-0.5 font-mono text-[9px] text-zinc-600">
              {subscriber.referralCode}
            </span>
          )}
        </DropdownMenuItem>

        {/* View my position on the leaderboard */}
        <DropdownMenuItem asChild>
          <Link
            href={`/w/${subscriber.waitlist.slug}/leaderboard`}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200 focus:bg-zinc-800/60"
          >
            <Trophy size={13} className="text-zinc-600" />
            View leaderboard
            <ExternalLink size={11} className="ml-auto text-zinc-700" />
          </Link>
        </DropdownMenuItem>

        {/* Browse more waitlists */}
        <DropdownMenuItem asChild>
          <Link
            href="/explore"
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200 focus:bg-zinc-800/60"
          >
            <LayoutGrid size={13} className="text-zinc-600" />
            Browse more waitlists
          </Link>
        </DropdownMenuItem>

        {/* How to earn */}
        <DropdownMenuItem asChild>
          <Link
            href="/how-to-earn"
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200 focus:bg-zinc-800/60"
          >
            <Zap size={13} className="text-zinc-600" />
            How to earn prizes
          </Link>
        </DropdownMenuItem>

        {/* Help */}
        <DropdownMenuItem asChild>
          <Link
            href="/how-to-earn#faq"
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200 focus:bg-zinc-800/60"
          >
            <HelpCircle size={13} className="text-zinc-600" />
            Help &amp; FAQ
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-800/60" />

        {/* Leave / clear session */}
        <DropdownMenuItem
          onClick={() => {
            document.cookie = "subscriberToken=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
            window.location.href = "/explore";
          }}
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-zinc-500 transition-colors hover:bg-red-500/8 hover:text-red-400 focus:bg-red-500/8"
        >
          <LogOut size={13} />
          Leave / clear session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}