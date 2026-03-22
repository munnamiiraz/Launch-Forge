"use server";

import type {
  ProfileForm, WorkspaceForm, NotificationPrefs,
} from "../_types";

/* ── Profile ─────────────────────────────────────────────────────── */
export async function updateProfileAction(
  form: ProfileForm,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, message: "Profile updated successfully." };
}

export async function changePasswordAction(
  current: string,
  next:    string,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 700));
  if (current === "wrong") return { success: false, message: "Current password is incorrect." };
  return { success: true, message: "Password changed successfully." };
}

/* ── Workspace ───────────────────────────────────────────────────── */
export async function updateWorkspaceAction(
  form: WorkspaceForm,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  if (form.slug.includes(" ")) return { success: false, message: "Slug may not contain spaces." };
  return { success: true, message: "Workspace updated successfully." };
}

export async function deleteWorkspaceAction(
  confirmText: string,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 800));
  if (confirmText !== "delete my workspace")
    return { success: false, message: "Confirmation text did not match." };
  return { success: true, message: "Workspace deletion initiated." };
}

/* ── Notifications ───────────────────────────────────────────────── */
export async function updateNotificationsAction(
  prefs: NotificationPrefs,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "Notification preferences saved." };
}

/* ── Security ────────────────────────────────────────────────────── */
export async function revokeSessionAction(
  sessionId: string,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "Session revoked." };
}

export async function createApiKeyAction(
  name:   string,
  scopes: string[],
): Promise<{ success: boolean; message: string; key?: string }> {
  await new Promise((r) => setTimeout(r, 500));
  const key = `lf_live_${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`;
  return { success: true, message: "API key created.", key };
}

export async function revokeApiKeyAction(
  keyId: string,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "API key revoked." };
}