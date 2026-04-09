import { Request, Response } from "express";
import { AiChatService } from "./ai-chat.service";
import { KnowledgeService } from "./knowledge.service";



export class AiChatController {
  static async chat(req: Request, res: Response) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({
          success: false,
          message: "A non-empty 'message' string is required",
        });
        return;
      }

      const reply = await AiChatService.chat(message, history || []);

      res.status(200).json({ success: true, data: reply });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Internal server error";
      console.error("[AiChatController] Error:", errMsg);
      res.status(500).json({ success: false, message: errMsg });
    }
  }
}
