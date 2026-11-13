# ADR 0004: StageGate Backend Architecture

## Status

Proposed

## Context

StageGate requires a backend capable of supporting multi-tenant organizations, events, CFPs, proposals, review workflows, scheduling and billing.

The backend must integrate with the existing Turborepo and npm workspace architecture.

## Decision

Use NestJS with the Express HTTP adapter.

Use TypeScript with CommonJS output and NodeNext module resolution.

Implement a modular monolith with independently defined business modules.

Use a separate worker application for background processing when asynchronous workflows are introduced.

## Configuration

Use NestJS ConfigModule and Zod for validated environment configuration.

Application services access configuration through a typed configuration service.

Invalid environment configuration prevents startup.

## API conventions

Use REST APIs with URI-based versioning.

Business endpoints are exposed under /api/v1.

Successful responses use a standardized envelope.

Failed responses use meaningful HTTP status codes and stable machine-readable error codes.

Unexpected errors must not expose internal details.

## Validation

Use global class-validator and class-transformer validation.

Reject unexpected DTO properties.

Disable implicit DTO property conversion.

## Request context

Use AsyncLocalStorage for request metadata.

Generate server-owned request IDs.

Request context is not an authorization mechanism.

## Health monitoring

Expose independent liveness and readiness endpoints.

Liveness must not depend on external infrastructure.

Readiness will include required dependencies as those dependencies are introduced.

## Security

Use Helmet and explicit CORS allowlists.

Limit request body sizes.

Disable public Swagger documentation in production.

Authentication and tenant authorization will be implemented in subsequent phases.

## Testing

Use Jest for backend unit tests.

Use Supertest for HTTP integration tests.

Integration tests must use the same application configuration as the production application.

## Consequences

- Consistent backend architecture
- Centralized cross-cutting infrastructure
- Stronger input validation
- Predictable API contracts
- Request-level correlation
- Incremental business module development

## Follow-up

- Firebase infrastructure
- Shared API contracts
- Docker infrastructure
- Structured logging
- Authentication
- Tenant authorization
- Distributed rate limiting
- Production shutdown orchestration
