/**
 * src/app/(dashboard)/layout.tsx
 *
 * Drop this file at the route group level so all /dashboard/* pages
 * automatically get the sidebar layout.
 *
 * Auth guard (uncomment once better-auth is wired):
 *
 *   import { auth } from "@/lib/auth";
 *   import { headers } from "next/headers";
 *   import { redirect } from "next/navigation";
 *
 *   const session = await auth.api.getSession({ headers: await headers() });
 *   if (!session) redirect("/login");
 */

import { DashboardLayout } from "@/src/components/module/dashboard/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
