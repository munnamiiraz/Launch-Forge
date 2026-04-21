"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export async function broadcastNewsletterAction(payload: { subject: string; body: string }) {
  const cookieStore = await cookies();
  
  // Extract all cookies and join them into a single string
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  console.log(`[Frontend-Action] Attempting broadcast with ${allCookies.length} cookies.`);

  try {
    const response = await fetch(`${API_BASE}/newsletter/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Crucial: Manually passing the cookie header to the backend
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
      // Prevent caching of this server action
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Frontend-Action] Backend responded with error:", data);
      throw new Error(data.message || `Server responded with ${response.status}`);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[broadcastNewsletterAction] Error:", err.message);
    return { success: false, error: err.message };
  }
}
