# StageGate Backend Development

## Prerequisites

Use the repository-pinned Node.js and npm versions.

Install dependencies from the repository root.

```bash
npm ci
```

## Environment

Create the local API environment:

```bash
cp apps/api/.env.example apps/api/.env.local
```

Do not commit local environment files.

## Development

```bash
npm run dev:api
```

The API listens on port 4000 by default.

## Endpoints

- GET /health/live
- GET /health/ready
- GET /docs/
- GET /docs/openapi.json

Business endpoints use /api/v1.

## Tests

```bash
npm run test:api
npm run test:api:watch
npm run test:api:coverage
npm run test:api:integration
```

## Build

```bash
npm run build:api
npm run start:api
```

## Architecture

- src/common: Cross-cutting infrastructure
- src/config: Environment configuration
- src/modules: Business and operational modules
- src/swagger: OpenAPI configuration
- src/configure-app.ts: HTTP application configuration
- src/main.ts: Application bootstrap

## API conventions

Controllers return DTOs or application results.

The global interceptor wraps successful responses.

Use ApiException for explicitly public application-specific errors.

Use RawResponse for operational endpoints and nonstandard response types.

## Validation

All request DTOs must declare validation rules.

Nested DTOs require explicit nested validation and transformation.

Never expose persistence entities directly.

## Verification

```bash
npm run check
```

## Current limitations

Firebase, authentication, tenant authorization, business modules and production infrastructure are not implemented yet.

Health readiness currently reflects application lifecycle state rather than external dependencies.
