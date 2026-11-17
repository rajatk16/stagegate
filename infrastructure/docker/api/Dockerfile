# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-bookworm-slim

# --------------------------------------------------
# Stage 1: Common build tooling
# --------------------------------------------------
FROM ${NODE_IMAGE} AS base

ARG NPM_VERSION=11.6.2

ENV TURBO_TELEMETRY_DISABLED=1 \
    DO_NOT_TRACK=1

WORKDIR /workspace

RUN npm install --global "npm@${NPM_VERSION}"

# --------------------------------------------------
# Stage 2: Prune the monorepo
# --------------------------------------------------
FROM base AS pruner

ARG TURBO_VERSION=2.5.8

RUN npm install --global "turbo@${TURBO_VERSION}"

COPY . .

RUN turbo prune @stagegate/api --docker

# --------------------------------------------------
# Stage 3: Install build dependencies
# --------------------------------------------------
FROM base AS dependencies

ENV NODE_ENV=development

COPY --from=pruner /workspace/out/json/ ./

COPY --from=pruner /workspace/.npmrc ./.npmrc

RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# --------------------------------------------------
# Stage 4: Compile API and internal packages
# --------------------------------------------------
FROM dependencies AS builder

COPY --from=pruner /workspace/out/full/ ./

COPY --from=pruner \
    /workspace/scripts \
    ./scripts

RUN npm exec -- turbo run build \
    --filter=@stagegate/api

# --------------------------------------------------
# Stage 5: Install production dependencies
# --------------------------------------------------
FROM base AS production-dependencies

ENV NODE_ENV=production

COPY --from=pruner /workspace/out/json/ ./

COPY --from=pruner /workspace/.npmrc ./.npmrc

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# --------------------------------------------------
# Stage 6: Minimal runtime image
# --------------------------------------------------
FROM ${NODE_IMAGE} AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000 \
    HOME=/home/node

WORKDIR /workspace

COPY --from=production-dependencies \
    --chown=node:node \
    /workspace/ \
    /workspace/

COPY --from=builder \
    --chown=node:node \
    /workspace/apps/api/dist \
    /workspace/apps/api/dist

COPY --from=builder \
    --chown=node:node \
    /workspace/packages/contracts/dist \
    /workspace/packages/contracts/dist

COPY --chown=node:node \
    infrastructure/docker/healthchecks/http-healthcheck.mjs \
    /workspace/healthcheck.mjs

USER node

EXPOSE 4000

STOPSIGNAL SIGTERM

HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=30s \
    --retries=3 \
    CMD ["node", "/workspace/healthcheck.mjs", "http://127.0.0.1:4000/health/ready", "200", "3000"]

CMD ["node", "--enable-source-maps", "apps/api/dist/main.js"]
