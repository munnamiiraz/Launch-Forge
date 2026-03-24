"use server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export interface PublicPrize {
  id: string;
  title: string;
  description: string | null;
  prizeType: string;
  value: number | null;
  currency: string | null;
  rankFrom: number;
  rankTo: number;
  imageUrl: string | null;
  expiresAt: string | null;
  rankLabel: string;
}

/**
 * Fetch public prizes by waitlist ID
 * Endpoint: GET /api/v1/prizes/public/:waitlistId
 */
export async function fetchPublicPrizes(waitlistId: string): Promise<PublicPrize[]> {
  try {
    const res = await fetch(`${BASE_API_URL}/prizes/public/${waitlistId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch prizes: ${res.statusText}`);
    }

    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching public prizes:", error);
    return [];
  }
}
