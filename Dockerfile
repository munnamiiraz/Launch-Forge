# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine for why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY server/package.json server/pnpm-lock.yaml ./server/
COPY client/package.json client/pnpm-lock.yaml ./client/

# Install dependencies
RUN cd server && pnpm install --frozen-lockfile
RUN cd client && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules

COPY . .

# Generate Prisma Client
RUN cd server && pnpm prisma generate

# Build server and client
RUN cd server && pnpm build
RUN cd client && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up server and client directories
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/generated ./server/generated

COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/client/node_modules ./client/node_modules

# Add start script
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000 5000

CMD ["/app/start.sh"]
