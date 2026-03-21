/**
 * src/app/(admin)/layout.tsx
 *
 * Drop this at your admin route group level so every /admin/* page
 * automatically gets the admin sidebar layout.
 *
 * Guard this with an ADMIN role check:
 *
 *   import { auth } from "@/src/lib/auth";
 *   import { headers } from "next/headers";
 *   import { redirect } from "next/navigation";
 *
 *   const session = await auth.api.getSession({ headers: await headers() });
 *   if (!session || session.user.role !== "ADMIN") redirect("/dashboard");
 */

import { AdminLayout } from "@/src/components/module/admin/_components/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}