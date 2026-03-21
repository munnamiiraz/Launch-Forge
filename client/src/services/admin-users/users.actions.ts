"use server";

export async function suspendUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "User suspended." };
}

export async function reactivateUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "User reactivated." };
}

export async function deleteUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, message: "User deleted." };
}

export async function promoteToAdminAction(userId: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "User promoted to admin." };
}

export async function demoteFromAdminAction(userId: string): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, message: "Admin role removed." };
}

export async function inviteUserAction(email: string, role: "USER" | "ADMIN"): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  if (!email.includes("@")) return { success: false, message: "Invalid email address." };
  return { success: true, message: `Invitation sent to ${email}.` };
}

export async function bulkSuspendAction(ids: string[]): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, message: `${ids.length} users suspended.` };
}

export async function bulkDeleteAction(ids: string[]): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 700));
  return { success: true, message: `${ids.length} users deleted.` };
}