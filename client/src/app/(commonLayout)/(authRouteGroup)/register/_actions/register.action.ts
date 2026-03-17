"use server";

import { z } from "zod";
import { RegisterActionResult } from "../_types";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function registerAction(
  formData: FormData
): Promise<RegisterActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate with Zod
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: RegisterActionResult["fieldErrors"] = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0] as keyof typeof fieldErrors;
      if (field) fieldErrors[field] = err.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    /**
     * Better-Auth server-side sign-up.
     * Replace the import path with your actual better-auth instance.
     *
     * import { auth } from "@/lib/auth";
     *
     * const result = await auth.api.signUpEmail({
     *   body: {
     *     name: parsed.data.name,
     *     email: parsed.data.email,
     *     password: parsed.data.password,
     *   },
     * });
     *
     * if (result.error) {
     *   if (result.error.status === 422) {
     *     return { success: false, error: "An account with this email already exists." };
     *   }
     *   return { success: false, error: result.error.message ?? "Registration failed." };
     * }
     */

    // ↑ Uncomment the block above and remove this simulated delay once
    //   your better-auth instance is wired up.
    await new Promise((r) => setTimeout(r, 800));

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
