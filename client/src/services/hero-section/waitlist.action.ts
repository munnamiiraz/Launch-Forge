"use server";

import { z } from "zod";
import { HeroWaitlistJoinResult } from "../../_types";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
});

export async function joinWaitlistAction(
  formData: FormData
): Promise<HeroWaitlistJoinResult> {
  const raw = {
    email: (formData.get("email") as string)?.trim(),
    name: (formData.get("name") as string)?.trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return {
      success: false,
      fieldError: first.message,
    };
  }

  try {
    /**
     * Replace with your actual DB / waitlist logic, e.g.:
     *
     * import { db } from "@/lib/db";
     * import { nanoid } from "nanoid";
     *
     * const existing = await db.waitlistEntry.findUnique({
     *   where: { email: parsed.data.email },
     * });
     * if (existing) {
     *   return { success: false, error: "You're already on the waitlist!" };
     * }
     *
     * const referralCode = nanoid(8).toUpperCase();
     * const count = await db.waitlistEntry.count();
     *
     * await db.waitlistEntry.create({
     *   data: {
     *     name: parsed.data.name,
     *     email: parsed.data.email,
     *     referralCode,
     *     position: count + 1,
     *   },
     * });
     *
     * return { success: true, position: count + 1, referralCode };
     */

    await new Promise((r) => setTimeout(r, 900));

    // Simulated response
    const position = Math.floor(Math.random() * 400) + 1_200;
    const referralCode = Math.random().toString(36).slice(2, 10).toUpperCase();

    return { success: true, position, referralCode };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
