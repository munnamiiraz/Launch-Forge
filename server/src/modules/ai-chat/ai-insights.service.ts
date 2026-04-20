import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { analyticsService } from "../owner-analytics/owner-analytics.service";
import { prisma } from "../../lib/prisma";

export class AiInsightsService {
  private static async getAiAdvice(stats: any): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "AI service not configured (API key missing)");
    }

    const prompt = `
      You are an expert SaaS Growth Consultant. Analyze the following workspace analytics for a viral waitlist platform and provide 3-4 actionable insights.
      
      STATS:
      - Total Subscribers: ${stats.totalSubscribers}
      - Total Referrals: ${stats.totalReferrals}
      - Confirmation Rate: ${stats.confirmationRate}%
      - Average Viral Score (K-Factor): ${stats.avgViralScore}
      - Active Referrers: ${stats.activeReferrers}
      - Weekly Growth Delta: ${stats.delta.subscribers}
      
      REQUIREMENTS:
      1. Be professional, direct, and data-driven.
      2. If confirmation rate is below 70%, suggest ways to improve email deliverability or UX.
      3. If Viral Score is below 1.0, suggest better referral incentives.
      4. If growth is negative, suggest marketing strategies.
      5. Output in clean Markdown format.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new AppError(status.BAD_GATEWAY, "AI generation failed");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static async generateDashboardInsights(workspaceId: string, userId: string) {
    const cacheKey = `ai:insights:${workspaceId}`;
    
    // 1. Check if we have a recent cached version
    const { redis } = await import("../../lib/redis");
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. If no cache, trigger background generation but return "Processing" 
    // to keep the API responsive.
    const { aiQueue } = await import("../../lib/queue");
    await aiQueue.add(`generate-${workspaceId}`, { workspaceId, userId });

    return {
      status: "processing",
      message: "AI is analyzing your data. Check back in a few seconds.",
      insights: null
    };
  }

  /**
   * Actual logic used by the BullMQ worker
   */
  static async generateAndCacheInsights(workspaceId: string, userId: string) {
    const cacheKey = `ai:insights:${workspaceId}`;

    // 1. Fetch current analytics summary
    const stats = await analyticsService.getSummary({
      workspaceId,
      requestingUserId: userId,
      query: { range: "30d" }
    });

    // 2. Pass to AI for analysis
    const insights = await this.getAiAdvice(stats);

    const result = {
      insights,
      status: "completed",
      generatedAt: new Date().toISOString(),
      statsSnapshot: {
        subscribers: stats.totalSubscribers,
        referrals: stats.totalReferrals,
        viralScore: stats.avgViralScore
      }
    };

    // 3. Cache the result for 1 hour
    const { redis } = await import("../../lib/redis");
    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

    return result;
  }
}
