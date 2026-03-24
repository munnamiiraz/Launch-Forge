import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader }       from "@/src/components/module/dashboard/_components/DashboardHeader";
import { SettingsNav }           from "@/src/components/module/settings/_components/SettingsNav";
import { ProfileSection }        from "@/src/components/module/settings/_components/ProfileSection";
import { WorkspaceSection }      from "@/src/components/module/settings/_components/WorkspaceSection";
import { NotificationsSection }  from "@/src/components/module/settings/_components/NotificationsSection";
import { SecuritySection }       from "@/src/components/module/settings/_components/SecuritySection";
// import { ThemeToggle }          from "@/src/components/shared/theme-toggle";
import type { SettingsPageData } from "@/src/components/module/settings/_types";
import { fetchProfileAction }   from "@/src/services/settings/settings.actions";

export const metadata: Metadata = {
  title:       "Settings — LaunchForge",
  description: "Manage your profile, workspace, notifications, and security.",
};

/* ─────────────────────────────────────────────────────────────────
   Server data — fetch from API
   ──────────────────────────────────────────────────────────────── */

async function getSettingsData(): Promise<SettingsPageData> {
  // Fetch profile from API
  const profileData = await fetchProfileAction();
  
  // Default mock data for other sections (to be replaced with real API calls)
  const mockData = {
    workspace: {
      name:        "Acme Corp",
      slug:        "acme-corp",
      logo:        "",
      description: "We're building the best products on the internet.",
    },
    notifications: {
      newSubscriber:       true,
      subscriberConfirmed: false,
      referralMade:        true,
      leaderboardChanged:  true,
      prizeAwarded:        true,
      feedbackSubmitted:   false,
      roadmapVote:         false,
      invoiceReady:        true,
      paymentFailed:       true,
      planChanged:         true,
      securityAlert:       true,
      productUpdates:      true,
      weeklyDigest:        true,
    },
    sessions: [
      {
        id: "s1", device: "Desktop", browser: "Chrome", os: "macOS",
        location: "Dhaka, BD", ip: "103.x.x.x",
        lastActive: "Just now", isCurrent: true,
      },
      {
        id: "s2", device: "Mobile", browser: "Safari", os: "iOS",
        location: "Dhaka, BD", ip: "103.x.x.x",
        lastActive: "2h ago", isCurrent: false,
      },
      {
        id: "s3", device: "Desktop", browser: "Firefox", os: "Windows",
        location: "London, UK", ip: "82.x.x.x",
        lastActive: "3 days ago", isCurrent: false,
      },
    ],
    apiKeys: [
      {
        id: "k1", name: "Production integration",
        prefix: "lf_live_abc1…",
        scopes: ["read"],
        createdAt: new Date(Date.now() - 15 * 86_400_000).toISOString(),
        lastUsedAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
      },
      {
        id: "k2", name: "Local dev",
        prefix: "lf_live_xyz9…",
        scopes: ["read"],
        createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
        lastUsedAt: null,
      },
    ],
    hasTwoFactor: false,
  };

  if (!profileData) {
    return {
      profile: {
        name:     "",
        email:    "",
        bio:      "",
        website:  "",
        timezone: "UTC",
        image:    undefined,
      },
      ...mockData,
    };
  }

  return {
    profile: profileData,
    ...mockData,
  };
}

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── Sticky header ───────────────────────────────────── */}
      <DashboardHeader
        title="Settings"
        subtitle="Manage your profile, workspace, and security"
      />

      <div className="flex gap-8 p-6 overflow-hidden">

        {/* ── Left: sticky tab nav (desktop only) ─────────── */}
        <SettingsNav />

        {/* ── Right: all sections ─────────────────────────── */}
        <div className="flex flex-1 flex-col gap-10 min-w-0">
          <ProfileSection       profile={data.profile}               />
          <WorkspaceSection     workspace={data.workspace}            />
          {/*
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how the application looks and feels.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="outline" />
            </div>
          </section>
          <NotificationsSection prefs={data.notifications}           />
          <SecuritySection
            sessions={data.sessions}
            apiKeys={data.apiKeys}
            hasTwoFactor={data.hasTwoFactor}
          />
          */}
        </div>
      </div>
    </div>
  );
}