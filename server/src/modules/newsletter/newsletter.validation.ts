import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z
    .string("Email is required.")
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .optional(),
});

export type SubscribeNewsletterDto = z.infer<typeof subscribeNewsletterSchema>;

