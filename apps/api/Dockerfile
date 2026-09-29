# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.20.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

WORKDIR /app

RUN npm install --global npm@11.19.0


FROM base AS manifests

COPY package.json package-lock.json .npmrc ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

COPY packages/typescript-config/package.json ./packages/typescript-config/package.json


FROM manifests AS build

RUN --mount=type=cache,target=/root/.npm \
    npm ci \
      --workspace api \
      --include-workspace-root=false

COPY apps/api ./apps/api

RUN npm run build --workspace api


FROM manifests AS production-dependencies

RUN --mount=type=cache,target=/root/.npm \
    npm ci \
      --workspace api \
      --include-workspace-root=false \
      --omit=dev

# npm can put dependencies here or hoist them to /app/node_modules.
RUN mkdir -p /app/apps/api/node_modules


FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=manifests /app/package.json ./package.json

COPY --from=production-dependencies \
    /app/node_modules ./node_modules

COPY --from=production-dependencies \
    /app/apps/api/package.json ./apps/api/package.json

COPY --from=production-dependencies \
    /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=build \
    /app/apps/api/dist ./apps/api/dist

USER node

EXPOSE 3000

STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || '3000') + '/api/v1/health', { signal: AbortSignal.timeout(2000) }).then(r => { if (!r.ok) process.exitCode = 1; }).catch(() => { process.exitCode = 1; });"]

CMD ["node", "apps/api/dist/main.js"]
