# ── Stage 1: Base image ──────────────────────────────────────────
FROM node:20-alpine AS base

# Set working directory inside container
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# ── Stage 2: Final image ─────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy installed node_modules from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy all server source files
COPY . .

# Expose the port Express listens on
EXPOSE 5000

# Health check — Docker will ping this every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
