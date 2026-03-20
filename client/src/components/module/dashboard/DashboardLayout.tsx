import { DashboardSidebar } from "./_components/DashboardSidebar";
import type { DashboardUser } from "./_types";

/**
 * Dashboard layout — wraps every dashboard page.
 *
 * Usage in src/app/(dashboard)/layout.tsx:
 *
 *   import { DashboardLayout } from "@/app/modules/dashboard/DashboardLayout";
 *   export default function Layout({ children }) {
 *     return <DashboardLayout>{children}</DashboardLayout>;
 *   }
 *
 * Auth guard:
 *   import { auth } from "@/lib/auth";
 *   import { redirect } from "next/navigation";
 *   const session = await auth.api.getSession({ headers: await headers() });
 *   if (!session) redirect("/login");
 */

import { cookies } from "next/headers";

const STUB_USER: DashboardUser = {
  id:             "usr_01",
  name:           "Ada Lovelace",
  email:          "ada@example.com",
  avatarInitials: "AL",
  avatarColor:    "from-indigo-500 to-violet-600",
  plan:           "pro",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

  const [userRes, wsRes] = await Promise.all([
    fetch(`${baseUrl}/auth/me`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
    fetch(`${baseUrl}/workspaces?limit=100`, { headers: { Cookie: cookieHeader }, cache: "no-store" }),
  ]);

  if (!userRes.ok) console.error("[DashboardLayout] /auth/me failed:", userRes.status, await userRes.text().catch(() => ""));
  if (!wsRes.ok)   console.error("[DashboardLayout] /workspaces failed:", wsRes.status, await wsRes.text().catch(() => ""));

  let user = STUB_USER;
  if (userRes.ok) {
    const resJson = await userRes.json().catch(() => null);
    if (resJson?.data) {
      const nameParts = (resJson.data.name || "").split(" ").filter(Boolean);
      const initials  = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (resJson.data.name || "UU").slice(0, 2).toUpperCase();
      user = {
        id:             resJson.data.id,
        name:           resJson.data.name,
        email:          resJson.data.email,
        avatarInitials: initials,
        avatarColor:    "from-indigo-500 to-violet-600",
        plan:           resJson.data.plan || "free",
      };
    }
  }

  let workspaces: { id: string; name: string; slug: string; plan: string }[] = [];
  if (wsRes.ok) {
    const wsJson = await wsRes.json().catch(() => null);
    if (wsJson?.data) {
      workspaces = wsJson.data;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <DashboardSidebar user={user} initialWorkspaces={workspaces} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
