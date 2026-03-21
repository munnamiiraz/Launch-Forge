import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateParams = (schema: z.ZodObject<any>) =>
(req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.params);
  if (!result.success) return next(result.error);
  req.params = result.data;  // sanitised + lowercased slug flows into controller
  next();
};