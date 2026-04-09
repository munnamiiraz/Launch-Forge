import { prisma } from "../../lib/prisma.js";

export class KnowledgeService {
  private static async getEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing");
    }

    // Since we're using OpenRouter, we can use their embeddings endpoint
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small", 
        input: text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding generation failed: ${response.status} - ${err}`);
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error("Failed to extract embedding from response");
    }
    
    return data.data[0].embedding;
  }

  static async ingest(content: string, metadata: Record<string, unknown> = {}) {
    // Basic chunking: Split by heading or paragraphs and filter small pieces
    const chunks = content.split(/\n={10,}\n|\n#{1,3} /).filter(c => c.trim().length > 50);
    
    console.log(`[KnowledgeService] Starting ingestion of ${chunks.length} chunks...`);

    let i = 0;
    for (const chunk of chunks) {
      i++;
      try {
        const embedding = await this.getEmbedding(chunk);
        
        // Use raw query for pgvector insert
        await prisma.$executeRawUnsafe(
          `INSERT INTO knowledge (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)`,
          Math.random().toString(36).substring(7) + Date.now().toString(36), // simple random ID
          chunk,
          JSON.stringify(metadata),
          `[${embedding.join(",")}]`
        );
        console.log(`[KnowledgeService] Successfully ingested chunk ${i}/${chunks.length}`);
      } catch (err: any) {
        console.error(`[KnowledgeService] Error ingesting chunk ${i}:`, err.message);
      }
      
      // Small delay to prevent rate limits
      await new Promise(res => setTimeout(res, 500));
    }
    
    console.log(`[KnowledgeService] Ingestion complete.`);
  }

  static async retrieve(query: string, limit: number = 3): Promise<string> {
    try {
      const queryEmbedding = await this.getEmbedding(query);
      const vectorStr = `[${queryEmbedding.join(",")}]`;
      
      // We search using the <=> operator for cosine distance.
      // 1 - (embedding <=> $1::vector) gives similarity.
      const results: { content: string; similarity: number }[] = await prisma.$queryRawUnsafe(
        `SELECT content, 1 - (embedding <=> $1::vector) as similarity 
         FROM knowledge 
         ORDER BY embedding <=> $1::vector 
         LIMIT $2`,
        vectorStr,
        limit
      );
      
      if (!results || results.length === 0) {
        console.warn("[KnowledgeService] No relevant chunks found in DB.");
        return "";
      }

      console.log(`[KnowledgeService] Retrieved ${results.length} relevant context chunks.`);
      
      return results.map(row => row.content).join("\n\n---\n\n");
    } catch (err: any) {
      console.error("[KnowledgeService] Retrieval error:", err.message);
      return "";
    }
  }
}
