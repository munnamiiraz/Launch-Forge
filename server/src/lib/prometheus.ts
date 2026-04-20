import { Registry, collectDefaultMetrics, Histogram, Counter } from "prom-client";
import { Request, Response, NextFunction } from "express";

// Create a Registry
export const register = new Registry();

// Enable the collection of default metrics (Removed the custom app label for better dashboard compatibility)
collectDefaultMetrics({ register });

/**
 * Custom metrics for HTTP requests
 */
export const httpRequestDurationMicroseconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"],
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);

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
