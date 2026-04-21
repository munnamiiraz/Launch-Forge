import winston from "winston";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { envVars } from "../config/env";

// ── 1. Initialize Sentry ────────────────────────────────────────
// Sentry should be initialized as early as possible
if (envVars.SENTRY_DSN) {
  Sentry.init({
    dsn: envVars.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, 
    profilesSampleRate: 1.0,
    environment: envVars.NODE_ENV || "development",
  });
  console.log("\x1b[32m[Telemetry] Sentry initialized successfully.\x1b[0m");
} else {
  console.log("\x1b[33m[Telemetry] Sentry DSN missing. Telemetry disabled.\x1b[0m");
}

// ── 2. Configure Winston ────────────────────────────────────────
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  // Always log to console
  new winston.transports.Console(),
  
  // In production, we could add file transports here
  // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  // new winston.transports.File({ filename: 'logs/all.log' }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// ── 3. Helper for Sentry Error Capture ──────────────────────────
export const logger = {
  error: (message: string, error?: any, metadata?: any) => {
    Logger.error(message, { ...metadata, error });
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error || new Error(message), {
        extra: { message, ...metadata },
      });
    }
  },
  warn: (message: string, metadata?: any) => {
    Logger.warn(message, metadata);
  },
  info: (message: string, metadata?: any) => {
    Logger.info(message, metadata);
  },
  http: (message: string, metadata?: any) => {
    Logger.http(message, metadata);
  },
  debug: (message: string, metadata?: any) => {
    Logger.debug(message, metadata);
  },
};

export default logger;
