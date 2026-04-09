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

const app: Application = express();
app.set('trust proxy', 1);
app.set("query parser", (str : string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`) )

// app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

app.use(cors({
    origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization", "x-auth-cookies"]
}))

// Needed for auth/payment routes (checkAuth reads req.cookies)
app.use(cookieParser());

app.all('/api/auth/{*any}', toNodeHandler(auth));

// Payment router must be mounted BEFORE express.json()
app.use("/api/payment", paymentRouter);
app.use("/api/v1/payment", paymentRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", IndexRoutes);

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
