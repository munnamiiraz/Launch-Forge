import { cookies } from "next/headers";
import { prisma }  from "@/src/lib/prisma";
import type { SubscriberNavUser } from "../_types";

/* Avatar colour pool — assigned deterministically from name initials */
const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
];

function pickAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Resolve the subscriber's context from the `subscriberToken` cookie.
 *
 * Cookie is set by the join API after a successful signup:
 *   res.cookie("subscriberToken", subscriber.id, {
 *     httpOnly: true,
 *     sameSite: "lax",
 *     secure:   process.env.NODE_ENV === "production",
 *     maxAge:   90 * 24 * 60 * 60,   // 90 days
 *   });
 *
 * Queue position is derived in-process from the ordered subscriber list
 * (ORDER BY referralsCount DESC, createdAt ASC) — same algorithm used
 * everywhere else in the leaderboard and public waitlist modules.
 */
export async function getSubscriberNavState(): Promise<{
  isSubscriber: boolean;
  subscriber:   SubscriberNavUser | null;
}> {
  /* 1. Read the subscriber ID from the cookie ─────────────────── */
  const cookieStore = await cookies();
  const token       = cookieStore.get("subscriberToken")?.value;

  if (!token) {
    return { isSubscriber: false, subscriber: null };
  }

  /* 2. Fetch subscriber + waitlist from DB ─────────────────────── */
  const raw = await prisma.subscriber.findUnique({
    where: { id: token, deletedAt: null },
    select: {
      id:             true,
      name:           true,
      email:          true,
      referralCode:   true,
      referralsCount: true,
      createdAt:      true,
      waitlist: {
        select: {
          id:     true,
          name:   true,
          slug:   true,
          isOpen: true,
        },
      },
    },
  });

  /* Invalid or deleted subscriber — clear the stale cookie on next response */
  if (!raw) {
    return { isSubscriber: false, subscriber: null };
  }

  /* 3. Derive queue position ───────────────────────────────────── *
   *
   * Position = rank in the ordered list for this waitlist:
   *   ORDER BY referralsCount DESC, createdAt ASC
   *
   * We count how many subscribers rank above this one using a single
   * COUNT query — O(1) DB call instead of fetching the full list.
   */
  const rankAbove = await prisma.subscriber.count({
    where: {
      waitlistId: raw.waitlist.id,
      deletedAt:  null,
      OR: [
        { referralsCount: { gt: raw.referralsCount } },
        {
          referralsCount: raw.referralsCount,
          createdAt:      { lt: raw.createdAt },
        },
      ],
    },
  });

  const position = rankAbove + 1;   // 1-based

  /* 4. Build the invite URL ───────────────────────────────────── */
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://launchforge.app";
  const inviteUrl = `${BASE_URL}/invite/${raw.referralCode}`;

  /* 5. Return the shaped subscriber nav user ──────────────────── */
  return {
    isSubscriber: true,
    subscriber: {
      name:           raw.name,
      email:          raw.email,
      maskedName:     maskName(raw.name),
      avatarInitials: raw.name
        .split(" ")
        .map((w) => w[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      avatarColor:    pickAvatarColor(raw.id),
      referralCode:   raw.referralCode,
      inviteUrl,
      position,
      referralCount:  raw.referralsCount,
      waitlist: {
        id:   raw.waitlist.id,
        name: raw.waitlist.name,
        slug: raw.waitlist.slug,
      },
    },
  };
}