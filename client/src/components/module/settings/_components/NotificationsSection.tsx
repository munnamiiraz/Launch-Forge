"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Users, Trophy, MessageSquare, CreditCard,
  Shield, CheckCircle2, Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Switch }  from "@/src/components/ui/switch";
import { Button }  from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Badge }   from "@/src/components/ui/badge";
import { cn }      from "@/src/lib/utils";
import { updateNotificationsAction } from "@/src/services/settings/settings.actions";
import type { NotificationPrefs } from "../_types";

interface NotifGroup {
  label:   string;
  icon:    React.ReactNode;
  accent:  string;
  items:   { key: keyof NotificationPrefs; label: string; description: string }[];
}

const GROUPS: NotifGroup[] = [
  {
    label:  "Subscribers",
    icon:   <Users size={13} />,
    accent: "text-indigo-400",
    items: [
      { key: "newSubscriber",       label: "New subscriber",       description: "When someone joins any of your waitlists." },
      { key: "subscriberConfirmed", label: "Email confirmed",       description: "When a subscriber confirms their email address." },
      { key: "referralMade",        label: "New referral",          description: "When a subscriber successfully refers someone." },
    ],
  },
  {
    label:  "Leaderboard & Prizes",
    icon:   <Trophy size={13} />,
    accent: "text-amber-400",
    items: [
      { key: "leaderboardChanged", label: "Leaderboard change",    description: "When the top 3 positions on a leaderboard change." },
      { key: "prizeAwarded",       label: "Prize awarded",          description: "When you manually award a prize to a winner." },
    ],
  },
  {
    label:  "Feedback & Product",
    icon:   <MessageSquare size={13} />,
    accent: "text-violet-400",
    items: [
      { key: "feedbackSubmitted", label: "New feature request",   description: "When someone submits a feature request." },
      { key: "roadmapVote",       label: "Roadmap vote",          description: "When someone votes on a roadmap item." },
    ],
  },
  {
    label:  "Billing",
    icon:   <CreditCard size={13} />,
    accent: "text-emerald-400",
    items: [
      { key: "invoiceReady",  label: "Invoice ready",        description: "When a new invoice is generated." },
      { key: "paymentFailed", label: "Payment failed",       description: "When a payment attempt fails — action required." },
      { key: "planChanged",   label: "Plan change",          description: "When your subscription is upgraded, downgraded, or cancelled." },
    ],
  },
  {
    label:  "System",
    icon:   <Shield size={13} />,
    accent: "text-rose-400",
    items: [
      { key: "securityAlert",   label: "Security alerts",      description: "New logins, password changes, and suspicious activity." },
      { key: "productUpdates",  label: "Product updates",      description: "New features, improvements, and announcements from LaunchForge." },
      { key: "weeklyDigest",    label: "Weekly digest",        description: "A weekly summary of your waitlist performance." },
    ],
  },
];

interface NotificationsSectionProps {
  prefs: NotificationPrefs;
}

export function NotificationsSection({ prefs }: NotificationsSectionProps) {
  const [form,      setForm]    = useState<NotificationPrefs>(prefs);
  const [dirty,     setDirty]   = useState(false);
  const [success,   setSuccess] = useState(false);
  const [isPending, startTx]    = useTransition();

  const toggle = (key: keyof NotificationPrefs) => {
    setForm((f) => ({ ...f, [key]: !f[key] }));
    setDirty(true);
    setSuccess(false);
  };

  const handleSave = () => {
    startTx(async () => {
      const r = await updateNotificationsAction(form);
      if (r.success) { setSuccess(true); setDirty(false); setTimeout(() => setSuccess(false), 3000); }
    });
  };

  const enabledCount = Object.values(form).filter(Boolean).length;
  const totalCount   = Object.keys(form).length;

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-900/40" id="notifications">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <CardHeader className="border-b border-zinc-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-zinc-200">Email notifications</p>
              <p className="text-[11px] text-zinc-600">
                Choose which events trigger an email to your inbox.
              </p>
            </div>
          </div>
          <Badge className="border-zinc-700/60 bg-zinc-800/40 text-[10px] text-zinc-500">
            {enabledCount}/{totalCount} enabled
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-0 p-0">
        {GROUPS.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <Separator className="bg-zinc-800/60" />}

            {/* Group header */}
            <div className={cn("flex items-center gap-2 px-5 py-3 text-xs font-semibold", group.accent)}>
              {group.icon}
              {group.label}
            </div>

            {/* Items */}
            {group.items.map((item, ii) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gi * 0.04 + ii * 0.03, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between gap-4 border-t border-zinc-800/30 px-5 py-3 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-300">{item.label}</p>
                  <p className="text-[11px] text-zinc-600">{item.description}</p>
                </div>
                <Switch
                  checked={form[item.key]}
                  onCheckedChange={() => toggle(item.key)}
                  className="shrink-0 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-zinc-700"
                />
              </motion.div>
            ))}
          </div>
        ))}

        {/* Save footer */}
        <Separator className="bg-zinc-800/60" />
        <div className="flex items-center justify-between px-5 py-4">
          <AnimatePresence>
            {success && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-emerald-400"
              >
                <CheckCircle2 size={13} />Preferences saved.
              </motion.span>
            )}
          </AnimatePresence>
          {!success && <span />}
          <Button
            onClick={handleSave}
            disabled={!dirty || isPending}
            size="sm"
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {isPending
              ? <><Loader2 size={12} className="animate-spin" />Saving…</>
              : "Save preferences"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}