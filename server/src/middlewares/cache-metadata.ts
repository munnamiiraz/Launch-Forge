import { Request, Response, NextFunction } from "express";
import { cacheStorage, getCacheStatus } from "../lib/redis/cache-tracker";

export const cacheMetadataMiddleware = (req: Request, res: Response, next: NextFunction) => {
  cacheStorage.run(new Map(), () => {
    // We wrap the rest of the request in the storage context
    const originalSend = res.send;

    // We override send to attach the header before the response leaves
    res.send = function (body: any) {
      const status = getCacheStatus();
      if (status) {
        res.setHeader("X-Cache", status);
      }
      return originalSend.call(this, body);
    };

    next();
  });
};
