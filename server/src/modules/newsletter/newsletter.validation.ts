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

export const broadcastNewsletterSchema = z.object({
  subject: z.string().min(5).max(150),
  body: z.string().min(10),
});

export type SubscribeNewsletterDto = z.infer<typeof subscribeNewsletterSchema>;
export type BroadcastNewsletterDto = z.infer<typeof broadcastNewsletterSchema>;

