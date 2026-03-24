"use server";

import { cookies } from "next/headers";
import type {
  ProfileForm, WorkspaceForm, NotificationPrefs,
} from "@/src/components/module/settings/_types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/* ── Forward the session cookie to the backend ────────────────────── */
async function authHeader(): Promise<HeadersInit> {
  const jar = await cookies();
  return {
    "Content-Type": "application/json",
    Cookie: jar.toString(),
  };
}

async function authCookieHeader(): Promise<HeadersInit> {
  const jar = await cookies();
  return {
    Cookie: jar.toString(),
  };
}

/* ── Profile ─────────────────────────────────────────────────────── */
export async function fetchProfileAction(): Promise<ProfileForm | null> {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "GET",
      headers: await authHeader(),
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) return null;
      throw new Error("Failed to fetch profile");
    }

    const json = await res.json();
    if (json.success && json.data) {
      return {
        name: json.data.name || "",
        email: json.data.email || "",
        bio: json.data.bio || "",
        website: json.data.website || "",
        timezone: json.data.timezone || "UTC",
        image: json.data.image || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateProfileAction(
  form: ProfileForm,
): Promise<{ success: boolean; message: string }> {
  try {
    // Email updates are not supported here (email is owned by auth provider).
    const { name, bio, website, timezone } = form;

    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "PATCH",
      headers: await authHeader(),
      body: JSON.stringify({ name, bio, website, timezone }),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to update profile" };
    }

    return { success: true, message: json.message || "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function uploadAvatarAction(
  file: File
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    
    const res = await fetch(`${API_BASE}/user/avatar`, {
      method: "POST",
      headers: await authCookieHeader(),
      body: formData,
      cache: "no-store",
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to upload avatar" };
    }

    return { 
      success: true, 
      message: json.message || "Avatar updated successfully",
      imageUrl: json.data?.image 
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function changePasswordAction(
  current: string,
  next:    string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/user/password`, {
      method: "PATCH",
      headers: await authHeader(),
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to change password" };
    }

    return { success: true, message: json.message || "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

/* ── Workspace ───────────────────────────────────────────────────── */
export async function updateWorkspaceAction(
  form: WorkspaceForm,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/workspaces/${form.slug}`, {
      method: "PATCH",
      headers: await authHeader(),
      body: JSON.stringify(form),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to update workspace" };
    }

    return { success: true, message: json.message || "Workspace updated successfully" };
  } catch (error) {
    console.error("Error updating workspace:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function deleteWorkspaceAction(
  confirmText: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/workspace`, {
      method: "DELETE",
      headers: await authHeader(),
      body: JSON.stringify({ confirm: confirmText }),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to delete workspace" };
    }

    return { success: true, message: json.message || "Workspace deletion initiated" };
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

/* ── Notifications ───────────────────────────────────────────────── */
export async function updateNotificationsAction(
  prefs: NotificationPrefs,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/user/notifications`, {
      method: "PATCH",
      headers: await authHeader(),
      body: JSON.stringify(prefs),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to update notifications" };
    }

    return { success: true, message: json.message || "Notification preferences saved" };
  } catch (error) {
    console.error("Error updating notifications:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

/* ── Security ────────────────────────────────────────────────────── */
export async function revokeSessionAction(
  sessionId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/user/sessions/${sessionId}`, {
      method: "DELETE",
      headers: await authHeader(),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to revoke session" };
    }

    return { success: true, message: json.message || "Session revoked" };
  } catch (error) {
    console.error("Error revoking session:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function createApiKeyAction(
  name:   string,
  scopes: string[],
): Promise<{ success: boolean; message: string; key?: string }> {
  try {
    const res = await fetch(`${API_BASE}/user/api-keys`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ name, scopes }),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to create API key" };
    }

    return { success: true, message: json.message || "API key created", key: json.data?.key };
  } catch (error) {
    console.error("Error creating API key:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function revokeApiKeyAction(
  keyId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/user/api-keys/${keyId}`, {
      method: "DELETE",
      headers: await authHeader(),
    });

    const json = await res.json();
    
    if (!res.ok) {
      return { success: false, message: json.message || "Failed to revoke API key" };
    }

    return { success: true, message: json.message || "API key revoked" };
  } catch (error) {
    console.error("Error revoking API key:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}
