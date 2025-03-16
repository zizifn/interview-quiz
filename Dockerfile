# Base stage with Node.js
FROM node:23.9.0-slim AS base
RUN corepack enable
WORKDIR /app

# Production dependencies stage for server
FROM base AS server-prod-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Build stage for server
FROM base AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
# Install all dependencies (including dev dependencies)
RUN --mount=type=cache,target=/root/.npm npm ci
COPY server ./
RUN npm run build

# Build stage for client
FROM base AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
# Install all dependencies
RUN --mount=type=cache,target=/root/.npm npm ci
COPY client ./
RUN npm run build

# Final stage - combine production dependencies and build output
FROM node:23.9.0-slim AS runner
WORKDIR /app
# Copy server production dependencies
COPY --from=server-prod-deps --chown=node:node /app/server/node_modules ./dist/node_modules
# Copy server build output
COPY --from=server-build --chown=node:node /app/server/dist ./dist
# Create public directory and copy client build files
RUN mkdir -p ./dist/public
COPY --from=client-build --chown=node:node /app/client/dist ./dist/public/

# Use the node user from the image
USER node

# Set PORT environment variable with a default value of 8080
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]
