import fs from "fs";
import path from "path";

// Quick test: can we compile and run the knowledge service?
try {
  const { KnowledgeService } = await import("../modules/ai-chat/knowledge.service.js");
  const result = await KnowledgeService.retrieve("What is LaunchForge?");
  fs.writeFileSync(
    path.resolve(process.cwd(), "test_result.txt"),
    `SUCCESS\nRetrieved ${result.length} chars\nFirst 200 chars:\n${result.slice(0, 200)}`
  );
} catch (err: any) {
  fs.writeFileSync(
    path.resolve(process.cwd(), "test_result.txt"),
    `FAILED\n${err.message}\n${err.stack}`
  );
}

process.exit(0);
