import { randomBytes } from "crypto";
import { NEWSLETTER_ID } from "./newsletter.constant";

export function generateNewsLadderId(): string {
  const bytes = randomBytes(NEWSLETTER_ID.LENGTH);
  return Array.from(bytes)
    .map((b) => NEWSLETTER_ID.ALPHABET[b % NEWSLETTER_ID.ALPHABET.length])
    .join("");
}

export function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Subscriber";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Subscriber";
  return cleaned.length > 80 ? cleaned.slice(0, 80) : cleaned;
}

