# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-bookworm-slim
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:stable-alpine

# --------------------------------------------------
# Stage 1: Common build tooling
# --------------------------------------------------
FROM ${NODE_IMAGE} AS base

ARG NPM_VERSION=11.6.2

ENV TURBO_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1

WORKDIR /workspace

RUN npm install --global "npm@${NPM_VERSION}"

# --------------------------------------------------
# Stage 2: Prune the monorepo
# --------------------------------------------------
FROM base AS pruner

ARG TURBO_VERSION=2.5.8

RUN npm install --global "turbo@${TURBO_VERSION}"

COPY . .

RUN turbo prune @stagegate/web --docker

# --------------------------------------------------
# Stage 3: Install dependencies
# --------------------------------------------------
FROM base AS dependencies

ENV NODE_ENV=development

COPY --from=pruner /workspace/out/json/ ./

COPY --from=pruner /workspace/.npmrc ./.npmrc

RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

# --------------------------------------------------
# Stage 4: Build the frontend
# --------------------------------------------------
FROM dependencies AS builder

ARG VITE_APP_NAME=StageGate
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_ENV=production
ARG VITE_ENABLE_QUERY_DEVTOOLS=false

ENV VITE_APP_NAME="${VITE_APP_NAME}" VITE_API_BASE_URL="${VITE_API_BASE_URL}" VITE_APP_ENV="${VITE_APP_ENV}" VITE_ENABLE_QUERY_DEVTOOLS="${VITE_ENABLE_QUERY_DEVTOOLS}"

COPY --from=pruner /workspace/out/full/ ./

COPY --from=pruner /workspace/scripts ./scripts

RUN npm exec -- turbo run build --filter=@stagegate/web

# --------------------------------------------------
# Stage 5: Static runtime
# --------------------------------------------------
FROM ${NGINX_IMAGE} AS runtime

COPY --from=builder /workspace/apps/web/dist/ /usr/share/nginx/html/

COPY infrastructure/docker/web/nginx.conf /etc/nginx/conf.d/default.conf

USER 101

EXPOSE 8080

STOPSIGNAL SIGQUIT

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"]

CMD ["nginx", "-g", "daemon off;"]
