"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  LifeBuoy,
  LogOut,
  ChevronDown,
  Sparkles,
  Bell,
  ExternalLink,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { PlanBadge } from "@/src/components/shared/navbar/_components/PlanBadge";
import type { NavUser } from "@/src/components/shared/navbar/_types";
import { cn } from "@/src/lib/utils";

interface UserMenuProps {
  user: NavUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    /**
     * Better-Auth sign out:
     *
     * import { authClient } from "@/lib/auth-client";
     * await authClient.signOut();
     * router.push("/");
     * router.refresh();
     */
    router.push("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group h-auto gap-2 rounded-lg border border-transparent px-2 py-1.5",
            "hover:border-zinc-800 hover:bg-zinc-900/60",
            "data-[state=open]:border-zinc-800 data-[state=open]:bg-zinc-900/60",
            "transition-all duration-150 focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        >
          {/* Avatar */}
          <Avatar className="h-7 w-7 rounded-lg">
            <AvatarFallback
              className={cn(
                "rounded-lg bg-gradient-to-br text-[11px] font-bold text-white",
                user.avatarColor
              )}
            >
              {user.avatarInitials}
            </AvatarFallback>
          </Avatar>

          {/* Name + plan — hidden on mobile */}
          <div className="hidden flex-col items-start gap-0.5 md:flex">
            <span className="max-w-[100px] truncate text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
              {user.name.split(" ")[0]}
            </span>
          </div>

          <ChevronDown
            size={13}
            className="text-zinc-600 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 border-zinc-800 bg-zinc-950/95 p-1.5 shadow-xl shadow-black/40 backdrop-blur-xl"
      >
        {/* User identity header */}
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarFallback
                className={cn(
                  "rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                  user.avatarColor
                )}
              >
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-zinc-100">
                {user.name}
              </span>
              <span className="truncate text-[11px] text-zinc-500">
                {user.email}
              </span>
            </div>
          </div>

          {/* Plan badge row */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <PlanBadge plan={user.plan} />
              <span className="text-[11px] text-zinc-500">Current plan</span>
            </div>
            <Link
              href="/settings/billing"
              className="flex items-center gap-1 text-[11px] text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Upgrade
              <ExternalLink size={9} />
            </Link>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-zinc-800/60" />

        {/* Navigation group */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60 focus:text-zinc-100">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <LayoutDashboard size={13} className="text-zinc-500" />
              Dashboard
              <DropdownMenuShortcut className="text-zinc-700">⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60 focus:text-zinc-100">
            <Link href="/dashboard/waitlists" className="flex items-center gap-2.5">
              <Users size={13} className="text-zinc-500" />
              My Waitlists
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60 focus:text-zinc-100">
            <Link href="/dashboard/notifications" className="flex items-center gap-2.5">
              <Bell size={13} className="text-zinc-500" />
              Notifications
              {/* Unread dot */}
              <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                3
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-zinc-800/60" />

        {/* Settings group */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60 focus:text-zinc-100">
            <Link href="/settings" className="flex items-center gap-2.5">
              <Settings size={13} className="text-zinc-500" />
              Settings
              <DropdownMenuShortcut className="text-zinc-700">⌘,</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60 focus:text-zinc-100">
            <Link href="/settings/billing" className="flex items-center gap-2.5">
              <CreditCard size={13} className="text-zinc-500" />
              Billing & Plan
            </Link>
          </DropdownMenuItem>

          {user.plan === "free" && (
            <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs focus:bg-indigo-500/10 focus:text-indigo-300">
              <Link
                href="/settings/billing"
                className="flex items-center gap-2.5 text-indigo-400 hover:text-indigo-300"
              >
                <Sparkles size={13} className="text-indigo-500" />
                Upgrade to Pro
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-zinc-800/60" />

        {/* Support + Sign out */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 focus:bg-zinc-800/60 focus:text-zinc-100">
            <Link href="/support" className="flex items-center gap-2.5">
              <LifeBuoy size={13} className="text-zinc-500" />
              Help & Support
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer rounded-md px-2 py-2 text-xs text-zinc-400 hover:bg-red-500/8 hover:text-red-400 focus:bg-red-500/8 focus:text-red-400"
          >
            <div className="flex w-full items-center gap-2.5">
              <LogOut size={13} />
              Sign out
              <DropdownMenuShortcut className="text-zinc-700">⇧⌘Q</DropdownMenuShortcut>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
