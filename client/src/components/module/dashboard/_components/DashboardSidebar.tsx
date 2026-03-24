"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Users, Trophy, MessageSquare,
  Map, Megaphone, CreditCard, Settings, ChevronLeft,
  ChevronRight, Plus, LogOut, Sparkles, BarChart3,
  Gift, ChevronDown, Building2, Check, Edit, Trash2
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";
import type { DashboardUser } from "../_types";
import { useWorkspace } from "@/src/provider/WorkspaceProvider";
import { logoutAction } from "@/src/services/auth/logout.action";

/* ── Nav structure ───────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",   href: "/dashboard",            icon: LayoutDashboard },
      { label: "Analytics",   href: "/dashboard/analytics",  icon: BarChart3 },
    ],
  },
  {
    label: "Waitlists",
    items: [
      { label: "All Waitlists",  href: "/dashboard/waitlists",              icon: Users },
      { label: "Leaderboard",    href: "/dashboard/leaderboard",            icon: Trophy },
      { label: "Prizes",         href: "/dashboard/prizes",                 icon: Gift,   badge: "New" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Feedback",   href: "/dashboard/feedback",  icon: MessageSquare },
      { label: "Roadmap",    href: "/dashboard/roadmap",   icon: Map },
      { label: "Changelog",  href: "/dashboard/changelog", icon: Megaphone },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Billing",   href: "/dashboard/billing",  icon: CreditCard },
      { label: "Settings",  href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface DashboardSidebarProps {
  user: DashboardUser;
  initialWorkspaces: Workspace[];
}

export function DashboardSidebar({ user, initialWorkspaces = [] }: DashboardSidebarProps) {
  const pathname  = usePathname();
  const router = useRouter();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);

  // Use activeWorkspace from context everywhere now.
  // No more local activeWs!

  const handleSetActive = (ws: Workspace) => {
    setActiveWorkspace(ws);
  };

  const [showNewWsDialog, setShowNewWsDialog] = useState(false);
  const [showEditWsDialog, setShowEditWsDialog] = useState(false);

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/workspaces/${workspaceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete workspace. Are you the owner?");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the workspace.");
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (document.getElementById("ws-name") as HTMLInputElement).value;
    const slug = (document.getElementById("ws-slug") as HTMLInputElement).value;
    if (!name || !slug) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, slug })
      });
      if (res.ok) {
        setShowNewWsDialog(false);
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create workspace.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating workspace.");
    }
  };

  const handleSignOut = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const handleEditWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    const name = (document.getElementById("edit-ws-name") as HTMLInputElement).value;
    const slug = (document.getElementById("edit-ws-slug") as HTMLInputElement).value;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/workspaces/${activeWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, slug })
      });
      if (res.ok) {
        setShowEditWsDialog(false);
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to edit workspace.");
      }
    } catch (err) {
      console.error(err);
      alert("Error editing workspace.");
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative flex h-screen flex-col overflow-hidden",
          "border-r border-border/60 bg-background",
          "shrink-0"
        )}
      >
        {/* Top gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        {/* ── Logo / workspace switcher ─────────────────────────── */}
        <div className="flex h-14 items-center justify-between border-b border-border/60 px-3">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-indigo-500/30 bg-indigo-500/15">
                        <Zap size={12} className="text-indigo-400" />
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-between">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
                        </span>
                        <ChevronDown size={13} className="ml-1 shrink-0 text-muted-foreground/60" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-52 border-zinc-800 bg-background/95 backdrop-blur-xl"
                  >
                    <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      Workspaces
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-muted/60" />
                    {initialWorkspaces.map((ws) => (
                      <DropdownMenuItem
                        key={ws.id}
                        onClick={() => handleSetActive(ws)}
                        className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60 focus:text-foreground"
                      >
                        <Building2 size={13} className="text-muted-foreground/60" />
                        <span className="flex-1">{ws.name}</span>
                        <span className="text-[10px] text-muted-foreground/60 capitalize">{ws.plan}</span>
                        {activeWorkspace?.id === ws.id && (
                          <Check size={11} className="text-indigo-400" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    {initialWorkspaces.length === 0 && (
                      <div className="py-2 px-3 text-xs text-muted-foreground/80">No workspaces found</div>
                    )}
                    <DropdownMenuSeparator className="bg-muted/60" />
                    <DropdownMenuItem 
                      onSelect={() => setShowNewWsDialog(true)}
                      className="cursor-pointer gap-2 text-xs text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground focus:bg-muted/60"
                    >
                      <Plus size={13} />
                      New workspace
                    </DropdownMenuItem>
                    {activeWorkspace && (
                      <>
                        <DropdownMenuSeparator className="bg-muted/60" />
                        <DropdownMenuItem 
                          onSelect={() => setShowEditWsDialog(true)} 
                          className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60"
                        >
                          <Edit size={13} />
                          Edit workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onSelect={(e) => { e.preventDefault(); handleDeleteWorkspace(activeWorkspace.id); }}
                          className="cursor-pointer gap-2 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        >
                          <Trash2 size={13} />
                          Delete workspace
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-indigo-500/30 bg-indigo-500/15"
              >
                <Zap size={13} className="text-indigo-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((v) => !v)}
            className="ml-1 h-6 w-6 shrink-0 rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground"
          >
            {collapsed
              ? <ChevronRight size={13} />
              : <ChevronLeft  size={13} />
            }
          </Button>
        </div>

        {/* ── Create waitlist CTA ───────────────────────────────── */}
        <div className={cn("px-3 py-3", collapsed && "px-2")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/waitlists/new">
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <Plus size={14} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                Create waitlist
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/dashboard/waitlists/new">
              <Button
                size="sm"
                className="group relative w-full overflow-hidden bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500 transition-all duration-200"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                <Plus size={13} />
                Create waitlist
              </Button>
            </Link>
          )}
        </div>

        {/* ── Nav groups ────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  {group.label}
                </p>
              )}

              {group.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-150",
                      isActive
                        ? "bg-indigo-500/12 text-indigo-300"
                        : "text-muted-foreground/80 hover:bg-zinc-800/50 hover:text-foreground/80",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <Icon
                      size={15}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-indigo-400" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {"badge" in item && item.badge && (
                          <Badge className="h-4 rounded-full border-emerald-500/30 bg-emerald-500/12 px-1.5 py-0 text-[9px] font-semibold text-emerald-400">
                            {item.badge}
                          </Badge>
                        )}
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        )}
                      </>
                    )}
                  </Link>
                );

                return collapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="border-zinc-800 bg-zinc-900 text-xs text-foreground/80">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : link;
              })}
            </div>
          ))}
        </nav>

        {/* ── User footer ───────────────────────────────────────── */}
        <div className="border-t border-border/60 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg p-2",
                  "hover:bg-zinc-800/50 transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-7 w-7 shrink-0 rounded-lg">
                  <AvatarFallback
                    className={cn(
                      "rounded-lg bg-gradient-to-br text-[11px] font-bold text-white",
                      user.avatarColor
                    )}
                  >
                    {user.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex min-w-0 flex-1 flex-col text-left">
                    <span className="truncate text-xs font-medium text-foreground/80">
                      {user.name}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground/60">
                      {user.email}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={8}
              className="w-56 border-zinc-800 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className={cn("rounded-lg bg-gradient-to-br text-sm font-bold text-white", user.avatarColor)}>
                      {user.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground/80">{user.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/60" />
              <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                <Link href="/dashboard/settings"><Settings size={13} />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:bg-muted/60">
                <Link href="/dashboard/billing"><CreditCard size={13} />Billing & Plan</Link>
              </DropdownMenuItem>
              {user.plan === "free" && (
                <DropdownMenuItem asChild className="cursor-pointer gap-2 text-xs text-indigo-400 hover:bg-indigo-500/10 focus:bg-indigo-500/10">
                  <Link href="/pricing"><Sparkles size={13} />Upgrade to Pro</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-muted/60" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-xs text-muted-foreground hover:bg-red-500/8 hover:text-red-400 focus:bg-red-500/8 focus:text-red-400"
              >
                <LogOut size={13} />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      {/* ── Create Workspace Modal ── */}
      <Dialog open={showNewWsDialog} onOpenChange={setShowNewWsDialog}>
        <DialogContent className="border-zinc-800 bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new workspace to manage a new product or team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Workspace Name</Label>
              <Input id="ws-name" placeholder="Acme Inc." className="border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-slug">Workspace Slug</Label>
              <Input id="ws-slug" placeholder="acme" className="border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowNewWsDialog(false)} className="hover:bg-zinc-800 hover:text-foreground">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white">Create Workspace</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Workspace Modal ── */}
      <Dialog open={showEditWsDialog} onOpenChange={setShowEditWsDialog}>
        <DialogContent className="border-zinc-800 bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your workspace&#39;s name and slug.
            </DialogDescription>
          </DialogHeader>
          <form key={activeWorkspace?.id || "form"} onSubmit={handleEditWorkspace} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ws-name">Workspace Name</Label>
              <Input id="edit-ws-name" defaultValue={activeWorkspace?.name} className="border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ws-slug">Workspace Slug</Label>
              <Input id="edit-ws-slug" defaultValue={activeWorkspace?.slug} className="border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowEditWsDialog(false)} className="hover:bg-zinc-800 hover:text-foreground">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
