# syntax=docker/dockerfile:1

# ── Builder ─────────────────────────────────────────────────────────
# Compiles better-sqlite3 (native), generates the Prisma client, and
# builds BOTH role builds (.next-participant / .next-organizer).
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Toolchain for native modules (better-sqlite3 / node-gyp).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# The postinstall hook runs `prisma generate`, and the generated client is
# gitignored (built here, not committed) — so the schema/config must be present
# before `npm ci`, or postinstall fails and the build breaks.
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
RUN npm ci

COPY . .

# A throwaway SQLite DB so any build-time DB access (prerender) succeeds.
# The real database lives on a mounted volume at runtime (see compose).
ENV DATABASE_URL="file:/app/build.db"
RUN npx prisma migrate deploy \
  && npm run build:participant \
  && npm run build:organizer \
  && rm -f /app/build.db

# ── Runner ──────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the fully-built app (incl. node_modules with the compiled native
# module + generated Prisma client, and both .next-* build dirs).
COPY --from=builder /app ./

# 3000 = participant service, 3001 = organizer service.
EXPOSE 3000 3001

# Overridden per service in docker-compose. NOTTEN_ROLE must match the port.
CMD ["npm", "run", "start:participant"]
