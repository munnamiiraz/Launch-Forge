# Performance Benchmarking Guide (LinkedIn Ready 🚀)

To get the perfect "Before vs After" graphs for your post, follow these steps.

## 1. Reset Everything
Ensure you start with a clean slate for both tests.
- **Reset Redis & Metrics:** Hit `GET /api/v1/__debug/reset` (Clears Redis keys and internal Hit/Miss counters).
- **Restart Metrics:** If using InfluxDB/Prometheus, clear the data source if you want a zeroed graph.

## 2. Test 1: Without Redis (The "Slow" Baseline)
This will generate the "Before" graph showing high latency and DB pressure.
1.  Set `CACHE_DISABLED=true` in your `.env`.
2.  Restart your server.
3.  Run the K6 test:
    ```bash
    k6 run load-tests/scripts/test.js
    ```
4.  **Note the P95 Latency & Error Rate.** Take a screenshot of the Grafana/K6 results.

## 3. Test 2: With Redis (The "Senior" Setup)
This will show the performance boost and the effect of Cache Locking.
1.  Set `CACHE_DISABLED=false` in your `.env`.
2.  Restart your server.
3.  **Optional: Pre-warm the cache** so the very first user gets a HIT:
    `GET /api/v1/__debug/warmup`
4.  Run the K6 test again.
5.  **Observe the Hit Rate** in the server console (goal: >90%).

## 4. Test 3: Cache Stampede (The Pro Test) 💣
This proves your lock works.
1.  Flush Redis again (`/__debug/reset`).
2.  Trigger a sudden spike without pre-warming.
3.  In the logs, you should see only **ONE [Redis MISS]** followed by several **[Redis LOCK] Wait and retry...** for the other simultaneous users.
4.  The final result will show that only 1 DB query was made despite 50+ users hitting at the exact same millisecond.

## 5. LinkedIn Post Strategy 📈
- **Slide 1:** "Stop killing your database with every request." (Show the baseline graph with high P95).
- **Slide 2:** "Senior performance engineering is about more than just `redis.set()`." (Explain the danger of Cache Stampedes).
- **Slide 3:** "Results: 20ms P95, 95% Hit Rate, 0 Connection Spikes." (Show the optimized graph).
- **The Secret Sauce:** Mention the **Distributed Locking** and **Recursive Polling** pattern you implemented.
