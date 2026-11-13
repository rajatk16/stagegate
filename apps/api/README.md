# @stagegate/api

StageGate backend API.

## Stack

- NestJS
- Express
- TypeScript
- Zod
- class-validator
- class-transformer
- Swagger
- Jest
- Supertest

## Development

From the repository root:

```bash
npm ci
cp apps/api/.env.example apps/api/.env.local
npm run dev:api
```

## Operational endpoints

| Endpoint           | Purpose          |
| ------------------ | ---------------- |
| /health/live       | Liveness         |
| /health/ready      | Readiness        |
| /docs/             | Swagger UI       |
| /docs/openapi.json | OpenAPI document |

## Verification

```bash
npm run test:api
npm run test:api:integration
npm run build:api
npm run check
```

See [Backend Development](../../docs/development/backend.md) for architecture and engineering conventions.
