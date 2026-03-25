import { NextFunction, Request, Response } from "express";
import z from "zod";

/**
 * Validates req.body against a Zod schema.
 * Replaces req.body with the parsed (sanitised) data on success.
 */
export const validateRequest = (zodSchema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Support multipart / form-data wrappers that nest JSON under req.body.data
        if (req.body && req.body.data) {
            try {
                req.body = JSON.parse(req.body.data);
            } catch {
                // not JSON — leave as-is
            }
        }

        const parsedResult = zodSchema.safeParse(req.body);

        if (!parsedResult.success) {
            return next(parsedResult.error);
        }

        // Replace body with sanitised / coerced data
        req.body = parsedResult.data;
        next();
    };
};

/**
 * Validates req.query against a Zod schema.
 * Replaces req.query with the parsed (coerced) data on success.
 */
export const validateQuery = (zodSchema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsedResult = zodSchema.safeParse(req.query);

        if (!parsedResult.success) {
            return next(parsedResult.error);
        }

        // Re-define req.query if it's a read-only getter to avoid crash
        Object.defineProperty(req, 'query', {
            value: parsedResult.data,
            writable: true,
            configurable: true,
            enumerable: true
        });
        next();
    };
};