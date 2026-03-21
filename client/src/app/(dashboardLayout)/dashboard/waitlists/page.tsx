import { type Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button }                      from "@/src/components/ui/button";
import { DashboardHeader }             from "@/src/components/module/dashboard/_components/DashboardHeader";
import { WorkspaceWaitlistsClient }    from "@/src/components/module/waitlists/_components/WorkspaceWaitlistsClient";

export const metadata: Metadata = {
  title: "Waitlists — LaunchForge",
  description: "Manage all your waitlists in one place.",
};

export default function WaitlistsPage() {
  return (
    <div className="flex flex-col">
      {/* ── Sticky header ──────────────────────────────────────── */}
      <DashboardHeader
        title="Waitlists"
        subtitle="All waitlists scoped to your active workspace"
      >
        {/* Full-page creation flow */}
        <Link href="/dashboard/waitlists/new">
          <Button
            size="sm"
            className="gap-2 bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Plus size={13} />
            New waitlist
          </Button>
        </Link>
      </DashboardHeader>

      {/* ── Page body ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 p-6">
        {/*
          WorkspaceWaitlistsClient is a client component that:
          - reads the active workspace from WorkspaceContext
          - fetches waitlists via GET /waitlists/:workspaceId
          - re-fetches automatically when the workspace changes
          - supports deleting a waitlist via DELETE /waitlists/:workspaceId/:id
        */}
        <WorkspaceWaitlistsClient />
      </div>
    </div>
  );
}