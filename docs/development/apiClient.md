# StageGate API Client

## Packages

@stagegate/contracts owns shared runtime schemas and API types.

@stagegate/apiClient owns HTTP communication.

## Build

```bash
npm run build:packages
```

## Test

```bash
npm run test:packages
npm run test:interop
```

## Frontend usage

Obtain the API client from React context.

```typescript
const client = useApiClient();
```

Use feature-specific resource functions and TanStack Query hooks.

## Authentication

Protected requests require an authentication token by default.

Public requests must explicitly specify:

```typescript
{
  auth: 'none';
}
```

The authentication layer registers the token provider.

## Response validation

Every successful JSON API response must be validated using a shared schema.

Do not cast unknown response payloads directly to application types.

## Error handling

Use ApiError and isApiError.

Use getApiErrorMessage for user-facing messages.

Never log raw Axios request configurations.

## Query keys

Use the centralized query key factories.

Scope organization-owned data by organization slug.

Scope event-owned data by organization and event slug.

## Cancellation

Pass TanStack Query's AbortSignal to API resource functions.

## Mutations

Automatic mutation retries are disabled.

Invalidate affected query keys after successful writes.

## Health

The health API calls unversioned endpoints:

- GET /health/live
- GET /health/ready

A valid unavailable readiness response is represented by status: unavailable.

## Adding a feature

1. Define shared request and response schemas.
2. Implement the backend endpoint.
3. Add backend contract compatibility tests.
4. Implement a typed API resource.
5. Add feature-specific query keys and hooks.
6. Integrate the resource with the UI.
7. Add client and component tests.
