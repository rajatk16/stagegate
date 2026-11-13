# StageGate Frontend Development

## Prerequisites

Use the repository-pinned Node.js and npm versions.

Install dependencies from the repository root:

```bash
npm ci
```

## Environment

Create the local frontend environment:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Never place server credentials in VITE\_ variables.

## Development

```bash
npm run dev:web
```

The frontend is available at http://localhost:3000.

## Tests

```bash
npm run test:web
npm run test:web:watch
npm run test:web:coverage
```

## Build

Provide the appropriate VITE\_ environment variables before building for a deployment environment.

```bash
npm run build:web
npm run preview:web
```

## Architecture

- src/app: Application composition and routing
- src/components: Reusable components
- src/config: Validated environment configuration
- src/features: Domain-specific features
- src/layouts: Route layouts
- src/lib: Infrastructure utilities
- src/pages: System pages
- src/stores: Client-side state
- src/styles: Global styling
- src/test: Frontend test infrastructure

## State management

Use TanStack Query for server state.

Use Zustand for persistent UI preferences.

Use URL search parameters for shareable filters.

Use component state for local interactions.

## Verification

```bash
npm run check
```

## Current limitations

The application currently contains static, non-sensitive foundation pages.

Authentication, organizations, events and CFP workflows are not implemented yet.

Do not deploy the application as an authenticated production service until the relevant security features have been implemented.
