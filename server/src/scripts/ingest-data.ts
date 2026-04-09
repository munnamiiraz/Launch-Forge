import { KnowledgeService } from "../modules/ai-chat/knowledge.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Handle ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function run() {
  try {
    const dataPath = path.resolve(__dirname, "../data/data.txt");
    if (!fs.existsSync(dataPath)) {
      console.error("Data file not found at " + dataPath);
      process.exit(1);
    }

    console.log("Starting ingestion into Postgres vector database...");
    
    // Read and fix any Windows line endings
    const content = fs.readFileSync(dataPath, "utf-8").replace(/\r\n/g, "\n");
    
    await KnowledgeService.ingest(content, { source: "data.txt" });
    
    console.log("Vector DB ingestion complete!");
    process.exit(0);
  } catch (error: any) {
    console.error("Ingestion failed:", error.message);
    process.exit(1);
  }
}

run();
