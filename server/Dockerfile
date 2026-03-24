# syntax=docker/dockerfile:1

# Build stage
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Enable pnpm via Corepack (ships with Node)
RUN corepack enable

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# Prisma client is generated into ./generated/client (see prisma/schema.prisma)
RUN pnpm run generate

# Compile TS -> dist/
RUN pnpm run build

# Keep only production deps for the final image
RUN pnpm prune --prod


# Runtime stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime artifacts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated

# EJS templates are loaded from "src/app/templates" at runtime (see server/src/app.ts),
# so we include just that folder.
COPY --from=build /app/src/app/templates ./src/app/templates

# Render sets $PORT; we expose 5000 for local runs.
EXPOSE 5000

CMD ["node", "dist/src/server.js"]

