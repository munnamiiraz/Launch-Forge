# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LaunchForge** is a multi-tenant SaaS platform for product launches — waitlists, referrals, feedback boards, roadmaps, and analytics. It uses a separate frontend (Next.js) and backend (Express) in a monorepo managed with pnpm.

## Commands

**Package manager:** pnpm (v10.20.0). Use `pnpm` not `npm` in both client and server.

### Server (`/server`)
```bash
pnpm dev          # Start dev server with tsx watch (auto-reload)
pnpm build        # TypeScript compile
pnpm start        # Run compiled production server
```

### Client (`/client`)
```bash
pnpm dev          # Next.js dev server
pnpm build        # Next.js production build
pnpm start        # Serve production build
pnpm lint         # ESLint
```

### Infrastructure
```bash
docker-compose up -d          # Start Redis (required for sessions)
npx prisma db push            # Push schema changes to DB
npx prisma migrate dev        # Create and run a migration
npx prisma generate           # Regenerate client after schema changes
```

> Prisma client outputs to `server/src/generated/client` (custom path — not the default).

## Architecture

### Request Flow
```
Browser → Next.js (port 3000) → Axios → Express API (port 5000) → Prisma → PostgreSQL
                                                                 → Redis (sessions/cache)
                                                                 → Cloudinary (media)
                                                                 → Stripe (payments)
```

### Server Structure (`/server/src`)
- **`server.ts`** — Entry point (HTTP server + cron jobs)
- **`app.ts`** — Express app setup, global middleware
- **`routes/index.ts`** — Mounts all module routers under `/api/v1/*`
- **`modules/`** — 20 feature modules, each with `*.route.ts`, `*.controller.ts`, `*.service.ts`
- **`lib/auth.ts`** — better-auth server instance (sessions, OAuth, OTP)
- **`lib/prisma.ts`** — Prisma client singleton
- **`lib/redis.ts`** — ioredis client
- **`middlewares/checkAuth.ts`** — Role-based auth guard: `checkAuth(...roles)`
- **`config/env.ts`** — Zod-validated environment variables

### Client Structure (`/client/src`)
- **`app/`** — Next.js App Router with layout groups:
  - `(authRouteGroup)/` — Login, register, verify, reset password
  - `(dashboardLayout)/` — Owner/team dashboard
  - `(admin)/` — Admin analytics, users, revenue
  - `(commonLayout)/` — Public marketing pages
  - `api/` — Client-side route handlers (proxies to Express)
- **`services/`** — Axios-based API service functions grouped by domain
- **`lib/auth-client.ts`** — better-auth React client + `useSession()` hook
- **`lib/axios.ts`** — Axios instance with refresh-token interceptors

### Multi-Tenancy
Every workspace is isolated. The `Workspace` model has plan tiers (`FREE`, `PRO`, `GROWTH`). Most routes scope queries to `workspaceId` derived from the authenticated user's session.

### Authentication
Two-layer system:
1. **better-auth (primary)** — Session tokens stored in Redis (5-min TTL), cookie-based (`httpOnly`, `SameSite`). Supports email/password + Google OAuth + email OTP.
2. **JWT fallback** — Access + refresh tokens in cookies, used when better-auth session is absent.

`checkAuth(...roles)` middleware validates both layers and enforces roles (`USER`, `OWNER`, `ADMIN`).

### Key Environment Variables
Server needs: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIS_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `EMAIL_SENDER_*` (SMTP config), `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CLOUDINARY_*`.

Client needs: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`.

See `/server/.env.example` and `/client/.env.example` for the full list.

## Adding a New Feature Module (Server)

1. Create `server/src/modules/<feature>/` with `<feature>.route.ts`, `<feature>.controller.ts`, `<feature>.service.ts`
2. Register the router in `server/src/routes/index.ts`
3. Add any new Prisma models to `server/prisma/schema.prisma`, then run `npx prisma db push` and `npx prisma generate`

## Prisma Notes

- Client is generated to `server/src/generated/client` — always import from there, not `@prisma/client`
- Uses the native PostgreSQL adapter (`@prisma/adapter-pg`), not the default Prisma engine
- pgvector extension is enabled for AI similarity search features
