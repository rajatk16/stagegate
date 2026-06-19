FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./

COPY apps/api/package.json ./apps/api/

RUN npm install

COPY . .

RUN npm run build -- --workspace=apps/api

# ------------------------------------------------------------

FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./

COPY apps/api/package.json ./apps/api/

RUN npm install --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
