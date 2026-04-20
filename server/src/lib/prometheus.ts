import client from "prom-client";
import { Request, Response, NextFunction } from "express";

// Create a Registry which will register the metrics
export const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: "launch-forge-server",
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

/* ── BullMQ Custom Metrics ─────────────────────────────────────── */
const queueSizeGauge = new client.Gauge({
  name: "bullmq_queue_size",
  help: "Total number of jobs in the queue",
  labelNames: ["queue", "status"],
  registers: [register],
});

// Update metrics periodically without hard dependencies to avoid circular imports
async function updateQueueMetrics() {
  try {
    const { emailQueue, aiQueue, webhookQueue } = await import("./queue");
    const queues = [
      { name: "email", instance: emailQueue },
      { name: "ai", instance: aiQueue },
      { name: "webhooks", instance: webhookQueue },
    ];

    for (const q of queues) {
      if (!q.instance) continue;
      const counts = await q.instance.getJobCounts();
      queueSizeGauge.set({ queue: q.name, status: "waiting" }, counts.waiting);
      queueSizeGauge.set({ queue: q.name, status: "active" }, counts.active);
      queueSizeGauge.set({ queue: q.name, status: "completed" }, counts.completed);
      queueSizeGauge.set({ queue: q.name, status: "failed" }, counts.failed);
      queueSizeGauge.set({ queue: q.name, status: "delayed" }, counts.delayed);
    }
  } catch (err) {
    // Fail silently to not crash the server if queues aren't ready
  }
}

setInterval(updateQueueMetrics, 30000);

/* ── HTTP Metrics ──────────────────────────────────────────────── */
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

/**
 * Middleware to track HTTP metrics
 */
export const prometheusMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    // Clean up route name for Prometheus labels
    const route = req.route ? req.route.path : req.path;

    httpRequestDurationMicroseconds
      .labels(req.method, route, String(res.statusCode))
      .observe(durationInSeconds);
      
    httpRequestsTotal
      .labels(req.method, route, String(res.statusCode))
      .inc();
  });

  next();
};
