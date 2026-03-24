import Link from "next/link";
import { Button }    from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { ReferralPill }    from "./ReferralPill";
import { SubscriberMenu }  from "./SubscriberMenu";
import type { SubscriberNavUser } from "../_types";

interface SubNavActionsProps {
  isSubscriber: boolean;
  subscriber:   SubscriberNavUser | null;
}

export function SubNavActions({ isSubscriber, subscriber }: SubNavActionsProps) {
  /* ── Subscriber is logged in / has joined a waitlist ────────── */
  if (isSubscriber && subscriber) {
    return (
      <div className="flex items-center gap-2">
        {/* Referral pill — copy invite link */}
        <ReferralPill
          inviteUrl={subscriber.inviteUrl}
          referralCount={subscriber.referralCount}
        />

        <Separator orientation="vertical" className="hidden h-4 bg-zinc-800 md:block" />

        {/* Subscriber avatar dropdown */}
        <SubscriberMenu subscriber={subscriber} />
      </div>
    );
  }

  /* ── Guest — hasn't joined any waitlist ─────────────────────── */
  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      >
        <Link href="/explore">Browse waitlists</Link>
      </Button>

      <Button
        asChild
        size="sm"
        className="group relative overflow-hidden bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-all duration-200"
      >
        <Link href="/explore">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          Join a waitlist
        </Link>
      </Button>
    </div>
  );
}