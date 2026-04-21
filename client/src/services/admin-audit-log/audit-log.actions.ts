"use client";

import { authFetch } from "@/src/lib/axios/authFetch";

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: any;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image: string | null;
  } | null;
}

export interface FetchAuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
}): Promise<FetchAuditLogsResponse> {
  const url = new URL(`${BASE_URL}/admin/audit-logs`);
  
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.action && params.action !== "all") url.searchParams.set("action", params.action);
  if (params.actorId) url.searchParams.set("actorId", params.actorId);

  const res = await authFetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch audit logs");
  }

  return json;
}
