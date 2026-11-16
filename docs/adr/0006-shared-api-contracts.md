# ADR 0006: Shared API Contracts and Client

## Status

Proposed

## Context

StageGate consists of React frontend applications and a NestJS backend.

Independent request and response types can drift, resulting in runtime failures despite successful TypeScript compilation.

## Decision

Introduce two shared workspace packages:

- @stagegate/contracts
- @stagegate/apiClient

The contracts package owns API wire formats, runtime schemas and shared error codes.

The API client owns HTTP transport, authentication token resolution, request cancellation, response validation and error normalization.

## Package interoperability

Both packages provide explicit ESM and CommonJS exports.

Frontend applications consume ESM.

The NestJS backend consumes CommonJS contracts.

## Runtime validation

Use Zod schemas to validate API responses.

Infer TypeScript types from runtime schemas.

Accept additive response fields for compatibility.

Allow future machine-readable error codes.

## Authentication

Resolve authentication tokens immediately before protected requests.

Do not store tokens inside Axios defaults.

Do not couple the API client to Firebase Auth.

The backend remains responsible for authorization.

## Error handling

Normalize HTTP, network, timeout, cancellation, authentication and contract errors.

Do not expose raw Axios request configurations.

## Retry strategy

TanStack Query owns automatic retries.

Retry only transient query failures.

Do not automatically retry mutations.

Respect server Retry-After headers.

## Pagination

Support offset and cursor pagination contracts.

Prefer cursor pagination for Firestore resources.

Treat cursors as opaque client-side values.

## Health endpoints

Health endpoints remain unversioned and unwrapped.

The API client handles them through a dedicated resource.

## Consequences

- Shared compile-time API types
- Runtime response validation
- Consistent client-side error handling
- Reusable transport across frontend applications
- Explicit package dependency boundaries
- Improved contract compatibility testing

## Limitations

Swagger DTO metadata remains manually maintained.

Runtime response validation adds a small processing cost.

HTTP 204 responses and binary downloads require explicit future transport methods.

Authentication token refresh and session recovery are deferred to Phase 2.

## Follow-up

- Docker infrastructure
- Centralized authentication integration
- Identity resource contracts
- Organization resource contracts
- Idempotency support
- File upload and download transport
