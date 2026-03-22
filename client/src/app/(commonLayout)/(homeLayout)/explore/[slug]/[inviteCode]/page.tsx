"use server";

import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; inviteCode: string }>;
}

export default async function ExploreInviteCodePage({ params }: PageProps) {
  const { slug, inviteCode } = await params;

  // Canonicalise to the existing `?ref=` flow so the join UI can auto-fill
  // without duplicating page logic.
  redirect(`/explore/${slug}?ref=${encodeURIComponent(inviteCode)}`);
}

