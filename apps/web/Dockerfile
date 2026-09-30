# syntax=docker/dockerfile:1

FROM node:24.20.0-bookworm-slim AS build

WORKDIR /app

RUN npm install --global npm@11.19.0

COPY package.json package-lock.json .npmrc ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm ci \
      --workspace web \
      --include-workspace-root=false \
      --include=dev

COPY packages/typescript-config ./packages/typescript-config
COPY apps/web ./apps/web

ARG VITE_API_BASE_URL
ARG VITE_FIREBASE_MODE=live
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_APP_ID

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_FIREBASE_MODE=${VITE_FIREBASE_MODE} \
    VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID} \
    VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY} \
    VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN} \
    VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}

RUN test "${VITE_FIREBASE_MODE}" = "live" \
    && test -n "${VITE_API_BASE_URL}" \
    && test -n "${VITE_FIREBASE_PROJECT_ID}" \
    && test -n "${VITE_FIREBASE_API_KEY}" \
    && test -n "${VITE_FIREBASE_AUTH_DOMAIN}" \
    && test -n "${VITE_FIREBASE_APP_ID}" \
    && npm run check:web


FROM nginx:alpine AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

RUN nginx -t

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
