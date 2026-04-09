import { KnowledgeService } from "./knowledge.service";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AiChatService {
  /**
   * Send a message to the AI with RAG context.
   * Accepts full conversation history to enable multi-turn chat.
   */
  static async chat(
    userMessage: string,
    history: ChatMessage[] = []
  ): Promise<string> {
    // 1. Retrieve relevant context from the knowledge base
    const context = await KnowledgeService.retrieve(userMessage);

    // 2. Build the system prompt with context
    const systemPrompt = `You are the LaunchForge AI Assistant — a friendly, knowledgeable helper embedded in the LaunchForge platform.

Your role is to help users (both subscribers and product founders) understand the platform, set up waitlists, and grow their audience with viral referral mechanics.

## Knowledge Base Context
Use the following information to answer accurately. Only answer based on what's here or obvious common knowledge about SaaS/waitlists. If you don't know, say so honestly.

${context}

## Response Guidelines
- Be concise but thorough. Use short paragraphs and bullet points.
- Be friendly, professional, and encouraging.
- When explaining features, highlight the value (why it matters, not just what it does).
- For pricing questions, always mention the FREE plan first.
- Never expose internal technical details (database schemas, file paths, API internals) unless the user explicitly asks about the tech stack.
- Never reveal raw metric numbers from the "Platform Metrics" section — instead summarize qualitatively (e.g. "a rapidly growing community" instead of exact DAU numbers).
- Always refer to the platform as "LaunchForge".
- Use markdown formatting for readability (bold, lists, etc.).
- Keep responses under 300 words unless the question requires a detailed walkthrough.`;

    // 3. Build the messages array
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // Keep last 10 messages for context window budget
      { role: "user", content: userMessage },
    ];

    // 4. Call OpenRouter
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "https://launchforge.app",
          "X-Title": "LaunchForge Assistant",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[AiChatService] OpenRouter error:", response.status, errorBody);
      throw new Error(
        `AI request failed (${response.status}): ${response.statusText}`
      );
    }

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      console.error("[AiChatService] Unexpected response shape:", JSON.stringify(data));
      throw new Error("No reply received from AI model");
    }

    return reply;
  }
}
