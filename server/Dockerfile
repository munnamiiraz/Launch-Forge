# Build stage — install deps & generate Prisma client
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Enable pnpm via Corepack (ships with Node)
RUN corepack enable

# Copy package files + prisma schema (needed for prisma generate)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install openssl (needed by Prisma) and all dependencies
RUN apt-get update -y && apt-get install -y openssl && pnpm install --no-frozen-lockfile

# Generate Prisma client
RUN npx prisma generate

# Prune dev dependencies (keep tsx since it's a prod dep)
RUN pnpm prune --prod --ignore-scripts


# Runtime stage — lean image with only what's needed
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install openssl for Prisma runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy production node_modules (includes tsx)
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/generated ./generated

# Copy source code (tsx runs TypeScript directly, no compilation needed)
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# Render sets $PORT; we expose 5000 for local runs.
EXPOSE 5000

# Run the server directly with tsx (handles ESM + extensionless imports)
CMD ["npx", "tsx", "src/server.ts"]