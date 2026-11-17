# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS development

ARG NPM_VERSION=11.6.2

ENV NODE_ENV=development HOME=/home/node TURBO_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1

WORKDIR /workspace

RUN npm install --global "npm@${NPM_VERSION}"

RUN chown node:node /workspace

COPY --chown=node:node package.json package-lock.json .npmrc ./

# Application manifests
COPY --chown=node:node apps/web/package.json apps/web/package.json

COPY --chown=node:node apps/api/package.json apps/api/package.json

COPY --chown=node:node apps/worker/package.json apps/worker/package.json

COPY --chown=node:node apps/admin/package.json apps/admin/package.json

# Shared package manifests
COPY --chown=node:node packages/contracts/package.json packages/contracts/package.json

COPY --chown=node:node packages/api-client/package.json packages/api-client/package.json

COPY --chown=node:node packages/typescript-config/package.json packages/typescript-config/package.json

COPY --chown=node:node packages/eslint-config/package.json packages/eslint-config/package.json

USER node

RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 npm ci --include=dev

COPY --chown=node:node . .

RUN npm run build:packages

COPY --chmod=755 infrastructure/docker/development/entrypoint.sh /usr/local/bin/stagegate-dev

COPY --chmod=755 infrastructure/docker/development/web-entrypoint.sh /usr/local/bin/stagegate-web-dev

EXPOSE 3000 4000

STOPSIGNAL SIGTERM

ENTRYPOINT ["/usr/local/bin/stagegate-dev"]

CMD ["npm", "run", "dev:api"]
