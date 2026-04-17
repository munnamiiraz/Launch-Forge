import { createClient } from "redis";
import { Redis } from "ioredis"; // [!code highlight]
import { envVars } from "../config/env";

export const redisClient = createClient({
  url: envVars.REDIS_URL || "redis://localhost:6379",
});

// For better-auth official redis adapter
export const ioRedis = new Redis(envVars.REDIS_URL || "redis://localhost:6379"); // [!code highlight]

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.on("connect", () => {
  console.log("Redis connected successfully.");
});

// Since top-level await isn't available everywhere unless we export a proper async init module,
// we'll just connect upon import.
// For robust setups, consider connecting inside a bootstrap/start application logic,
// but for our current generic approach this works immediately.
export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}
