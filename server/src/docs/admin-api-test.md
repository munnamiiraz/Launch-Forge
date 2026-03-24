# Admin Analytics & Revenue API Testing Guide

This document provides test commands for the admin analytics and revenue API endpoints.

## Base URL

```
http://localhost:5000/api/v1
```

## Prerequisites

1. Make sure the server is running
2. You need a valid admin authentication cookie (login as admin first)

---

## Admin Analytics Endpoints

### 1. Engagement KPIs

**Endpoint:** `GET /admin/analytics/engagement`

Returns DAU, WAU, MAU, stickiness ratio, and session metrics.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/engagement \
  -H "Cookie: your-admin-cookie"
```

### 2. Engagement Timeline

**Endpoint:** `GET /admin/analytics/engagement/timeline?range=30d|60d`

Returns daily active users timeline with optional range parameter.

```bash
# 30 day range
curl -X GET "http://localhost:5000/api/v1/admin/analytics/engagement/timeline?range=30d" \
  -H "Cookie: your-admin-cookie"

# 60 day range
curl -X GET "http://localhost:5000/api/v1/admin/analytics/engagement/timeline?range=60d" \
  -H "Cookie: your-admin-cookie"
```

### 3. Feature Adoption

**Endpoint:** `GET /admin/analytics/features`

Returns percentage of workspaces using each product feature.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/features \
  -H "Cookie: your-admin-cookie"
```

### 4. Platform Subscribers

**Endpoint:** `GET /admin/analytics/subscribers`

Returns 12-month platform subscriber growth data.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/subscribers \
  -H "Cookie: your-admin-cookie"
```

### 5. Waitlist Health

**Endpoint:** `GET /admin/analytics/waitlists`

Returns waitlist size distribution histogram and health stats.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/waitlists \
  -H "Cookie: your-admin-cookie"
```

### 6. Referral Network

**Endpoint:** `GET /admin/analytics/referrals`

Returns referral network timeline and platform-wide k-factor.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/referrals \
  -H "Cookie: your-admin-cookie"
```

### 7. Feedback Health

**Endpoint:** `GET /admin/analytics/feedback`

Returns feedback status breakdown and 30-day activity.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/feedback \
  -H "Cookie: your-admin-cookie"
```

### 8. Roadmap Progress

**Endpoint:** `GET /admin/analytics/roadmap`

Returns roadmap item status distribution.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/roadmap \
  -H "Cookie: your-admin-cookie"
```

### 9. Changelog Trends

**Endpoint:** `GET /admin/analytics/changelog`

Returns 12-month changelog publishing trend.

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/changelog \
  -H "Cookie: your-admin-cookie"
```

### 10. Activity Heatmap

**Endpoint:** `GET /admin/analytics/heatmap`

Returns workspace activity heatmap (7 days × 24 hours).

```bash
curl -X GET http://localhost:5000/api/v1/admin/analytics/heatmap \
  -H "Cookie: your-admin-cookie"
```

---

## Admin Revenue Endpoints

### 1. Revenue KPIs

**Endpoint:** `GET /admin/revenue/kpis`

Returns 9-card KPI strip: MRR, ARR, growth, churn, LTV, ARPU, etc.

```bash
curl -X GET http://localhost:5000/api/v1/admin/revenue/kpis \
  -H "Cookie: your-admin-cookie"
```

### 2. MRR Waterfall

**Endpoint:** `GET /admin/revenue/waterfall`

Returns 12-month MRR waterfall area chart data.

```bash
curl -X GET http://localhost:5000/api/v1/admin/revenue/waterfall \
  -H "Cookie: your-admin-cookie"
```

### 3. Plan Revenue

**Endpoint:** `GET /admin/revenue/plans`

Returns plan breakdown donut and churn-by-plan bar chart.

```bash
curl -X GET http://localhost:5000/api/v1/admin/revenue/plans \
  -H "Cookie: your-admin-cookie"
```

### 4. Churn Analysis

**Endpoint:** `GET /admin/revenue/churn`

Returns 12-month churn analysis data.

```bash
curl -X GET http://localhost:5000/api/v1/admin/revenue/churn \
  -H "Cookie: your-admin-cookie"
```

### 5. Cohort LTV

**Endpoint:** `GET /admin/revenue/cohorts`

Returns cohort LTV heatmap (6 monthly cohorts × M1/M3/M6/M12 MRR).

```bash
curl -X GET http://localhost:5000/api/v1/admin/revenue/cohorts \
  -H "Cookie: your-admin-cookie"
```

### 6. Revenue by Country

**Endpoint:** `GET /admin/revenue/countries`

Returns revenue by country - users, MRR, % of total.

```bash
curl -X GET http://localhost:5000/api/v1/admin/revenue/countries \
  -H "Cookie: your-admin-cookie"
```

### 7. Recent Transactions

**Endpoint:** `GET /admin/revenue/transactions?type=all&page=1&limit=20`

Returns paginated and searchable transaction list.

```bash
# All transactions, page 1, 20 per page
curl -X GET "http://localhost:5000/api/v1/admin/revenue/transactions?type=all&page=1&limit=20" \
  -H "Cookie: your-admin-cookie"

# Filter by type (new, renewal, upgrade, downgrade, cancel, refund)
curl -X GET "http://localhost:5000/api/v1/admin/revenue/transactions?type=new&page=1&limit=10" \
  -H "Cookie: your-admin-cookie"
```

---

## Admin Users Endpoints

### 1. Get All Users

**Endpoint:** `GET /admin/users`

Returns paginated list of all users.

```bash
curl -X GET "http://localhost:5000/api/v1/admin/users?page=1&limit=20" \
  -H "Cookie: your-admin-cookie"
```

### 2. Get User by ID

**Endpoint:** `GET /admin/users/:id`

Returns user details by ID.

```bash
curl -X GET http://localhost:5000/api/v1/admin/users/user-uuid \
  -H "Cookie: your-admin-cookie"
```

### 3. Update User

**Endpoint:** `PATCH /admin/users/:id`

Updates user fields (plan, status, role).

```bash
curl -X PATCH http://localhost:5000/api/v1/admin/users/user-uuid \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-cookie" \
  -d '{
    "plan": "PRO",
    "status": "ACTIVE"
  }'
```

### 4. Delete User

**Endpoint:** `DELETE /admin/users/:id`

Soft deletes a user.

```bash
curl -X DELETE http://localhost:5000/api/v1/admin/users/user-uuid \
  -H "Cookie: your-admin-cookie"
```

---

## Testing with JavaScript/fetch

### Example: Get All Analytics Data

```javascript
const BASE_URL = "http://localhost:5000/api/v1";
const COOKIE = "your-admin-cookie";

async function getAllAnalytics() {
  const endpoints = [
    "/admin/analytics/engagement",
    "/admin/analytics/engagement/timeline?range=30d",
    "/admin/analytics/features",
    "/admin/analytics/subscribers",
    "/admin/analytics/waitlists",
    "/admin/analytics/referrals",
    "/admin/analytics/feedback",
    "/admin/analytics/roadmap",
    "/admin/analytics/changelog",
    "/admin/analytics/heatmap",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Cookie: COOKIE },
      });
      const data = await response.json();
      console.log(`${endpoint}:`, data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  }
}

getAllAnalytics();
```

### Example: Get All Revenue Data

```javascript
async function getAllRevenue() {
  const endpoints = [
    "/admin/revenue/kpis",
    "/admin/revenue/waterfall",
    "/admin/revenue/plans",
    "/admin/revenue/churn",
    "/admin/revenue/cohorts",
    "/admin/revenue/countries",
    "/admin/revenue/transactions?type=all&page=1&limit=20",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Cookie: COOKIE },
      });
      const data = await response.json();
      console.log(`${endpoint}:`, data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  }
}

getAllRevenue();
```

---

## Error Responses

### Unauthorized (not logged in)

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Forbidden (not an admin)

```json
{
  "success": false,
  "message": "Admin access required"
}
```

### Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```
