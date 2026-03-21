import { type Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

import { DashboardHeader }   from "@/src/components/module/dashboard/_components/DashboardHeader";
import { CreateWaitlistForm } from "@/src/components/module/waitlists/new/_components/CreateWaitlistForm";

export const metadata: Metadata = {
  title: "New Waitlist — LaunchForge",
  description: "Create a new viral waitlist for your product.",
};

/**
 * /dashboard/waitlists/new
 *
 * Full-page dedicated creation flow.
 * Left side: react-hook-form with live Zod validation.
 * Right side: sticky live preview of the public page.
 *
 * The existing <CreateWaitlistDialog> is still available as a quick shortcut
 * from the dashboard overview. This page is the full-featured version.
 */
export default function NewWaitlistPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Create waitlist"
        subtitle="Configure your new waitlist and go live"
      />

      <div className="mx-auto w-full max-w-5xl px-6 py-8">

        {/* Breadcrumb */}
        <Link
          href="/dashboard/waitlists"
          className="mb-8 flex w-fit items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <ArrowLeft size={13} />
          Back to waitlists
        </Link>

        {/* Page header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15">
            <Zap size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              New waitlist
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Fill in the details below. Your waitlist will be live instantly — the preview
              on the right updates as you type.
            </p>
          </div>
        </div>

        {/* Form + preview */}
        <CreateWaitlistForm />
      </div>
    </div>
  );
}