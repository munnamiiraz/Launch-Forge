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
    // 1. Fetch current analytics summary
    const stats = await analyticsService.getSummary({
      workspaceId,
      requestingUserId: userId,
      query: { range: "30d" }
    });

    // 2. Pass to AI for analysis
    const insights = await this.getAiAdvice(stats);

    // 3. Save to database (optional, but good for history)
    // For now we just return it.
    return {
      insights,
      generatedAt: new Date().toISOString(),
      statsSnapshot: {
        subscribers: stats.totalSubscribers,
        referrals: stats.totalReferrals,
        viralScore: stats.avgViralScore
      }
    };
  }
}
