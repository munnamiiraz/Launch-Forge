"use server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function fetchPublicWaitlist(slug: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/public/waitlist/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch waitlist: ${res.statusText}`);
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching public waitlist:", error);
    return null;
  }
}

export async function joinWaitlistAction(payload: {
  slug: string;
  name: string;
  email: string;
  referralCode?: string;
}) {
  try {
    const normalizedReferralCode = payload.referralCode?.trim().toUpperCase() || undefined;

    const res = await fetch(`${BASE_API_URL}/public/waitlist/${payload.slug}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        ...(normalizedReferralCode ? { referralCode: normalizedReferralCode } : {}),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to join waitlist",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
