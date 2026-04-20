import { Server } from "http";
import app from "./app";
import { envVars } from "./config/env";
import { connectRedis, redis } from "./lib/redis/index";
import { closeQueues } from "./lib/queue";

let server: Server;

const bootstrap = async() => {
    try {
        await connectRedis();
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });

        // ----- Graceful Shutdown Handling -----
        const handleShutdown = async (signal: string) => {
            console.log(`\n[${signal}] Received. Starting graceful shutdown...`);
            
            if (server) {
                server.close(async () => {
                   console.log('[HTTP] Server closed.');
                   
                   try {
                     // Close Queues and Workers
                     await closeQueues();
                     
                     // Close main Redis client
                     await redis.quit();
                     console.log('[Redis] Main connection closed.');
                     
                     console.log('[System] Shutdown complete. Goodbye!');
                     process.exit(0);
                   } catch (err) {
                     console.error('[System] Error during shutdown:', err);
                     process.exit(1);
                   }
                });

                // Force exit after 10s if graceful shutdown hangs
                setTimeout(() => {
                  console.error('[System] Shutdown timed out. Force exiting...');
                  process.exit(1);
                }, 10000);
            } else {
                process.exit(0);
            }
        };

        process.on("SIGTERM", () => handleShutdown("SIGTERM"));
        process.on("SIGINT", () => handleShutdown("SIGINT"));

    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

bootstrap();