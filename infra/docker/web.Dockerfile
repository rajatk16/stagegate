FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./

COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

RUN npm install

COPY . .

RUN npm run build --workspace=apps/web

# -------------------------

FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
