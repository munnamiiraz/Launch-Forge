"use server";

import { httpClient } from "@/src/lib/axios/httpClient";

export async function suspendUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.patch(`/admin/users/${userId}/suspend`, {});
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to suspend user." };
  }
}

export async function reactivateUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.patch(`/admin/users/${userId}/reactivate`, {});
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to reactivate user." };
  }
}

export async function deleteUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.delete(`/admin/users/${userId}`);
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to delete user." };
  }
}

export async function promoteToAdminAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.patch(`/admin/users/${userId}/promote`, {});
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to promote user." };
  }
}

export async function demoteFromAdminAction(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.patch(`/admin/users/${userId}/demote`, {});
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to demote user." };
  }
}

export async function inviteUserAction(email: string, role: "USER" | "ADMIN"): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.post("/admin/users/invite", { email, role });
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to invite user." };
  }
}

export async function bulkSuspendAction(ids: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.post("/admin/users/bulk/suspend", { userIds: ids });
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to bulk suspend users." };
  }
}

export async function bulkDeleteAction(ids: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const response = await httpClient.post("/admin/users/bulk/delete", { userIds: ids });
    return { success: response.success, message: response.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to bulk delete users." };
  }
}