# Base stage with Node.js
FROM node:23.9.0-slim AS base
RUN corepack enable
WORKDIR /app

# Production dependencies stage for server
FROM base AS server-prod-deps
WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package.json server/package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Build stage for server
FROM base AS server-build
WORKDIR /app/server
ENV NODE_ENV=development
COPY server/package.json server/package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY server ./
RUN npm run build

# Build stage for client
FROM base AS client-build
WORKDIR /app/client
ENV NODE_ENV=production
COPY client/package.json client/package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm npm ci
COPY client ./
RUN npm run build

# Final stage - combine production dependencies and build output
FROM node:23.9.0-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy server production dependencies
COPY --from=server-prod-deps --chown=node:node /app/server/node_modules ./dist/node_modules

COPY --from=server-build --chown=node:node /app/server/dist ./dist

RUN mkdir -p ./dist/public
COPY --from=client-build --chown=node:node /app/client/dist ./dist/public/

USER node

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
