# Payment API Testing Guide

This document provides test commands for the payment API endpoints.

## Base URL

```
http://localhost:5000/api/v1
```

## Prerequisites

1. Make sure the server is running
2. You need a valid authentication cookie (login first)

---

## 1. Create Checkout Session

**Endpoint:** `POST /payment/checkout`

Creates a Stripe Checkout session for subscription payment.

### Request

```bash
curl -X POST http://localhost:5000/api/v1/payment/checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "planType": "PRO",
    "planMode": "MONTHLY"
  }'
```

### Alternative with fetch (JavaScript)

```javascript
const response = await fetch("http://localhost:5000/api/v1/payment/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: "your-auth-cookie",
  },
  body: JSON.stringify({
    planType: "PRO", // or "GROWTH"
    planMode: "MONTHLY", // or "YEARLY"
  }),
});

const data = await response.json();
console.log(data);
// Returns: { success: true, url: "https://checkout.stripe.com/..." }
```

### Plan Options

| planType | planMode | Price     |
| -------- | -------- | --------- |
| PRO      | MONTHLY  | $9/month  |
| PRO      | YEARLY   | $90/year  |
| GROWTH   | MONTHLY  | $29/month |
| GROWTH   | YEARLY   | $290/year |

---

## 2. Get Payment Status

**Endpoint:** `GET /payment/status`

Returns the current user's payment status and subscription details.

### Request

```bash
curl -X GET http://localhost:5000/api/v1/payment/status \
  -H "Cookie: your-auth-cookie"
```

### Response Example

```json
{
  "success": true,
  "message": "Payment status fetched successfully.",
  "data": {
    "hasPaid": true,
    "activePlan": "PRO",
    "payment": {
      "id": "payment-uuid",
      "userId": "user-uuid",
      "status": "PAID",
      "planType": "PRO",
      "planMode": "MONTHLY",
      "amount": 900,
      "currency": "usd",
      "createdAt": "2026-03-24T12:00:00.000Z",
      "updatedAt": "2026-03-24T12:00:00.000Z"
    }
  }
}
```

---

## 3. Create Billing Portal Session

**Endpoint:** `POST /payment/portal`

Creates a Stripe Billing Portal session for managing subscription.

### Request

```bash
curl -X POST http://localhost:5000/api/v1/payment/portal \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

### Response

```json
{
  "success": true,
  "message": "Billing portal session created successfully.",
  "data": {
    "url": "https://billing.stripe.com/..."
  }
}
```

---

## 4. Stripe Webhook

**Endpoint:** `POST /payment/webhook`

This endpoint receives events from Stripe. It's used internally to update payment status after checkout completion.

### Test with Stripe CLI

```bash
# Forward webhook events to local server
stripe listen --forward-to localhost:5000/api/v1/payment/webhook

# Trigger a test checkout completed event
stripe trigger checkout.session.completed
```

---

## Testing Flow

### Happy Path Test

1. **Login** - Get authentication cookie
2. **Create Checkout** - Call `/payment/checkout` with plan details
3. **Redirect to Stripe** - User completes payment on Stripe
4. **Webhook** - Stripe sends webhook to `/payment/webhook`
5. **Check Status** - Call `/payment/status` to verify subscription

### Test with Existing User

```javascript
// Test creating checkout for PRO monthly
const checkoutResponse = await fetch("/api/v1/payment/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: "auth-cookie-from-login",
  },
  body: JSON.stringify({
    planType: "PRO",
    planMode: "MONTHLY",
  }),
});

const { url } = await checkoutResponse.json();
console.log("Redirect to:", url);
// User pays on Stripe, then webhook updates their payment status

// Check updated status
const statusResponse = await fetch("/api/v1/payment/status", {
  headers: { Cookie: "auth-cookie-from-login" },
});
const status = await statusResponse.json();
console.log("Payment status:", status.data.hasPaid); // should be true
```

---

## Error Responses

### Already Paid

```json
{
  "success": false,
  "message": "You already have an active subscription. Manage it via the billing portal."
}
```

### Not Found (User doesn't exist)

```json
{
  "success": false,
  "message": "User not found."
}
```

### No Subscription (for portal)

```json
{
  "success": false,
  "message": "No active subscription found."
}
```
