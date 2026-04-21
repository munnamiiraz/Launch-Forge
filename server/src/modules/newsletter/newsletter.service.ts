import status from "http-status";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  NewsletterSubscribePayload,
  NewsletterSubscribeResult,
} from "./newsletter.interface";
import { generateNewsLadderId, deriveNameFromEmail } from "./newsletter.utils";

async function generateUniqueNewsLadderId(): Promise<string> {
  let attempts = 0;
  while (attempts < 5) {
    const candidate = generateNewsLadderId();
    const collision = await prisma.user.findUnique({
      where: { newsLadderId: candidate },
      select: { id: true },
    });
    if (!collision) return candidate;
    attempts++;
  }

  throw new AppError(
    status.INTERNAL_SERVER_ERROR,
    "Could not generate a unique subscription ID. Please try again.",
  );
}

export const newsletterService = {
  async subscribe(payload: NewsletterSubscribePayload): Promise<NewsletterSubscribeResult> {
    const email = payload.email.trim().toLowerCase();
    const name = payload.name?.trim();

    const existing = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        newsLadder: true,
        newsLadderId: true,
      },
    });

    if (existing) {
      if (existing.newsLadder && existing.newsLadderId) {
        return {
          alreadySubscribed: true,
          email: existing.email,
          newsLadderId: existing.newsLadderId,
        };
      }

      const ensuredId = existing.newsLadderId ?? await generateUniqueNewsLadderId();
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          newsLadder: true,
          newsLadderId: ensuredId,
        },
        select: { email: true, newsLadderId: true },
      });

      return {
        alreadySubscribed: false,
        email: updated.email,
        newsLadderId: updated.newsLadderId!,
      };
    }

    const ensuredId = await generateUniqueNewsLadderId();
    const created = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        name: name || deriveNameFromEmail(email),
        newsLadder: true,
        newsLadderId: ensuredId,
      },
      select: { email: true, newsLadderId: true },
    });

    return {
      alreadySubscribed: false,
      email: created.email,
      newsLadderId: created.newsLadderId!,
    };
  },

  async broadcastNewsletter(subject: string, body: string) {
    const { newsletterQueue } = await import("../../lib/queue");
    
    const job = await newsletterQueue.add("broadcast-" + Date.now(), {
      subject,
      body,
    });

    return {
      jobId: job.id,
      status: "enqueued"
    };
  },

  async sendTestNewsletter(email: string, subject: string, body: string) {
    const { emailQueue } = await import("../../lib/queue");
    
    await emailQueue.add("test-newsletter-" + Date.now(), {
      to: email,
      subject: "[PREVIEW] " + subject,
      templateName: "newsletter", 
      templateData: {
        name: "Admin",
        content: body
      }
    });

    return { success: true };
  }
};

