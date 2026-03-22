"use server";

import { cookies } from "next/headers";
import type { Prize, CreatePrizeForm, PrizeStatus } from "@/src/components/module/prizes/_types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function authFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

async function resolveWorkspaceId(waitlistId: string): Promise<string> {
  const res = await authFetch(`${API_BASE}/waitlists/by-id/${waitlistId}`);
  const json = (await res.json()) as ApiResponse<{ workspaceId: string }>;
  if (!res.ok) throw new Error(json.message || "Failed to resolve workspaceId");
  if (!json.data?.workspaceId) throw new Error("Malformed waitlist response");
  return json.data.workspaceId;
}

function toExpiresAtIso(expiresAt: string | undefined): string | undefined {
  const v = expiresAt?.trim();
  if (!v) return undefined;
  return new Date(v).toISOString();
}

export async function createPrizeAction(
  waitlistId: string,
  form: CreatePrizeForm,
): Promise<{ success: boolean; message: string; data?: Prize }> {
  try {
    const workspaceId = await resolveWorkspaceId(waitlistId);

    const payload = {
      waitlistId,
      workspaceId,
      title: form.title,
      description: form.description?.trim() ? form.description.trim() : undefined,
      prizeType: form.prizeType,
      value: form.value?.trim() ? Number.parseFloat(form.value) : undefined,
      currency: form.currency?.trim() ? form.currency.trim() : undefined,
      rankFrom: Number.parseInt(form.rankFrom || "1", 10),
      rankTo: Number.parseInt(form.rankTo || "1", 10),
      imageUrl: form.imageUrl?.trim() ? form.imageUrl.trim() : undefined,
      expiresAt: toExpiresAtIso(form.expiresAt),
    };

    const res = await authFetch(`${API_BASE}/prizes`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as ApiResponse<Prize>;

    if (!res.ok) return { success: false, message: json.message || "Failed to create prize." };
    return { success: true, message: json.message || "Prize created successfully.", data: json.data };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to create prize." };
  }
}

export async function updatePrizeAction(
  prizeId: string,
  waitlistId: string,
  form: Partial<CreatePrizeForm> & { status?: PrizeStatus },
): Promise<{ success: boolean; message: string; data?: Prize }> {
  try {
    const workspaceId = await resolveWorkspaceId(waitlistId);

    const payload: Record<string, unknown> = {
      workspaceId,
      waitlistId,
    };

    if (form.title !== undefined) payload.title = form.title;
    if (form.description !== undefined) payload.description = form.description.trim() ? form.description.trim() : null;
    if (form.prizeType !== undefined) payload.prizeType = form.prizeType;
    if (form.value !== undefined) payload.value = form.value.trim() ? Number.parseFloat(form.value) : null;
    if (form.currency !== undefined) payload.currency = form.currency.trim() ? form.currency.trim() : null;
    if (form.rankFrom !== undefined) payload.rankFrom = Number.parseInt(form.rankFrom || "1", 10);
    if (form.rankTo !== undefined) payload.rankTo = Number.parseInt(form.rankTo || "1", 10);
    if (form.imageUrl !== undefined) payload.imageUrl = form.imageUrl.trim() ? form.imageUrl.trim() : null;
    if (form.expiresAt !== undefined) payload.expiresAt = form.expiresAt.trim() ? toExpiresAtIso(form.expiresAt) : null;
    if (form.status !== undefined) payload.status = form.status;

    const res = await authFetch(`${API_BASE}/prizes/${prizeId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as ApiResponse<Prize>;

    if (!res.ok) return { success: false, message: json.message || "Failed to update prize." };
    return { success: true, message: json.message || "Prize updated successfully.", data: json.data };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to update prize." };
  }
}

export async function deletePrizeAction(
  prizeId: string,
  waitlistId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const workspaceId = await resolveWorkspaceId(waitlistId);

    const res = await authFetch(`${API_BASE}/prizes/${prizeId}`, {
      method: "DELETE",
      body: JSON.stringify({ workspaceId, waitlistId }),
    });
    const json = (await res.json()) as ApiResponse<unknown>;

    if (!res.ok) return { success: false, message: json.message || "Failed to delete prize." };
    return { success: true, message: json.message || "Prize deleted successfully." };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete prize." };
  }
}

export async function cancelPrizeAction(
  prizeId: string,
  waitlistId: string,
): Promise<{ success: boolean; message: string; data?: Prize }> {
  return updatePrizeAction(prizeId, waitlistId, { status: "CANCELLED" });
}

