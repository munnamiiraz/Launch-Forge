"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  LifeBuoy,
  LogOut,
  ChevronDown,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { PlanBadge } from "@/src/components/shared/navbar/_components/PlanBadge";
import type { NavUser } from "@/src/components/shared/navbar/_types";
import { cn } from "@/src/lib/utils";
import { logoutAction } from "@/src/services/auth/logout.action";

interface UserMenuProps {
  user: NavUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await logoutAction();
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
            "hover:border-zinc-800 hover:bg-card/60",
            "data-[state=open]:border-zinc-800 data-[state=open]:bg-card/60",
            "transition-all duration-150 focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        >
          {/* Avatar */}
          <Avatar className="h-7 w-7 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
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
            <span className="max-w-[100px] truncate text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {user.name.split(" ")[0]}
            </span>
          </div>

          <ChevronDown
            size={13}
            className="text-muted-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 border-zinc-800 bg-background/95 p-1.5 shadow-xl shadow-black/40 backdrop-blur-xl"
      >
        {/* User identity header */}
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
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
              <span className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="truncate text-[11px] text-muted-foreground/80">
                {user.email}
              </span>
            </div>
          </div>

          {/* Plan badge row */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border/80 bg-zinc-900/50 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <PlanBadge plan={user.plan} />
              <span className="text-[11px] text-muted-foreground/80">Current plan</span>
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

        <DropdownMenuSeparator className="my-1 bg-muted/60" />

        {/* Navigation group */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60 focus:text-foreground">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <LayoutDashboard size={13} className="text-muted-foreground/80" />
              Dashboard
              <DropdownMenuShortcut className="text-muted-foreground/40">⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-muted/60" />

        {/* Settings group */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60 focus:text-foreground">
            <Link href="/settings" className="flex items-center gap-2.5">
              <Settings size={13} className="text-muted-foreground/80" />
              Settings
              <DropdownMenuShortcut className="text-muted-foreground/40">⌘,</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60 focus:text-foreground">
            <Link href="/settings/billing" className="flex items-center gap-2.5">
              <CreditCard size={13} className="text-muted-foreground/80" />
              Billing & Plan
            </Link>
          </DropdownMenuItem>


        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-muted/60" />

        {/* Support + Sign out */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60 focus:text-foreground">
            <Link href="/support" className="flex items-center gap-2.5">
              <LifeBuoy size={13} className="text-muted-foreground/80" />
              Help & Support
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer rounded-md px-2 py-2 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 focus:bg-red-500/20"
          >
            <div className="flex w-full items-center gap-2.5">
              <LogOut size={13} />
              Sign out
              <DropdownMenuShortcut className="text-muted-foreground/40">⇧⌘Q</DropdownMenuShortcut>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
