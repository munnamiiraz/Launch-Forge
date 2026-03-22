"use server";

import { CreateWaitlistApiResponse, CreateWaitlistFormValues } from "@/src/components/module/waitlists/new/_types";

/**
 * Server Action — creates a waitlist by calling your Express backend.
 *
 * Wire this up once your backend URL is configured:
 *
 *   const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";
 *
 *   const res = await fetch(
 *     `${BACKEND}/api/workspaces/${workspaceId}/waitlists`,
 *     {
 *       method:  "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         "Cookie":        cookies().toString(),   // forward session cookie
 *       },
 *       body: JSON.stringify({
 *         name:        values.name,
 *         slug:        values.slug,
 *         description: values.description || undefined,
 *         logoUrl:     values.logoUrl     || undefined,
 *         isOpen:      values.isOpen,
 *       }),
 *     },
 *   );
 *
 *   return res.json();
 */
import { cookies } from "next/headers";

export async function createWaitlistAction(
  values:      CreateWaitlistFormValues,
  workspaceId: string,
): Promise<CreateWaitlistApiResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

    const res = await fetch(`${baseUrl}/waitlists/${workspaceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        logoUrl: values.logoUrl || undefined,
        isOpen: values.isOpen,
      }),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Something went wrong. Please try again.",
    };
  }
}