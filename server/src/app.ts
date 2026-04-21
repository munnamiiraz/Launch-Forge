/* eslint-disable @typescript-eslint/no-explicit-any */
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import cron from "node-cron";
import path from "path";
import qs from "qs";
import { envVars } from "./config/env";
import { auth } from "./lib/auth";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
// import { PaymentController } from "./app/modules/payment/payment.controller";
import { IndexRoutes } from "./routes";
import { paymentRouter } from "./modules/payment/payment.route";

import compression from "compression";
import { cacheMetadataMiddleware } from "./middlewares/cache-metadata";
import { prometheusMiddleware, register } from "./lib/prometheus";
import { serverAdapter } from "./lib/queue/setup"; // Bull‑Board UI
import basicAuth from "express-basic-auth"; 
import { globalLimiter, strictLimiter } from "./middlewares/security";
import helmet from "helmet";

const app: Application = express();

// Prometheus Metrics Endpoint (Must be BEFORE other middlewares to avoid noise, or after for better context)
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// ── 3. Standard Middlewares ────────────────────────────────────
app.use(cors({
    origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:3000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization", "Cookie"]
}))

// Use compression and caching
app.use(compression());
app.use(cacheMetadataMiddleware);
app.use(prometheusMiddleware);

// Security Middlewares
// Relax cross-origin-opener-policy for better-auth callback compatibility
app.use(helmet({
  crossOriginOpenerPolicy: false, 
}));

if (process.env.NODE_ENV === "production") {
  app.use(globalLimiter);
}

app.set('trust proxy', 1);
app.set("query parser", (str : string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`) )

// ── 4. Critical Parser Middlewares ────────────────────────────
// MUST be before routes to handle Cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── 5. Routes ─────────────────────────────────────────────────

// BETTER-AUTH (Prefix mount - works with all Express versions)
app.use('/api/auth', toNodeHandler(auth));

// STRIPE
app.use("/api/payment", paymentRouter);
app.use("/api/v1/payment", paymentRouter);

// Apply strict rate limiting to sensitive AUTH routes BEFORE they are matched
app.use("/api/v1/auth", strictLimiter);
app.use("/api/v1/newsletter", strictLimiter);

// MAIN API
app.use("/api/v1", IndexRoutes);

// ----- Bull‑Board UI -----
const adminAuth = basicAuth({
  users: { admin: "adminPassword" },
  challenge: true,
});
app.use('/admin/queues', adminAuth, serverAdapter.getRouter());

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'API is working',
    })
});

app.use(globalErrorHandler)
app.use(notFound)


export default app;
