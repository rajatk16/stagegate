# @stagegate/apiClient

Framework-independent StageGate HTTP API client.

## Usage

```typescript
import { createApiClient } from '@stagegate/apiClient';

const client = createApiClient({
  baseUrl: 'http://localhost:4000/api/v1',
});

const health = await client.health.readiness();
```

## Responsibilities

- HTTP transport
- Authentication token resolution
- Request IDs
- Runtime response validation
- Request cancellation
- Typed error normalization

## Build

```bash
npm run build --workspace=@stagegate/apiClient
```

## Test

```bash
npm run test --workspace=@stagegate/apiClient
```

## Rules

- No React dependency
- No Firebase dependency
- No TanStack Query dependency
- No automatic mutation retries
- No raw Axios error exposure
