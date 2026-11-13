# ADR 0003: StageGate Frontend Architecture

## Status

Proposed

## Context

StageGate requires a scalable frontend supporting organization management, CFP workflows, reviewer workspaces and speaker participation.

The frontend must integrate with the existing Turborepo and npm workspace foundation.

## Decision

Use React, Vite and TypeScript for the Web application.

Use Tailwind CSS 4 and locally owned shadcn/ui components for the design system.

Use React Router with nested layouts and lazy feature routes.

Use TanStack Query for remote server state.

Use Zustand for persistent client-side preferences.

## Application structure

The application uses feature-oriented modules.

Application providers and router composition live under src/app.

Reusable UI primitives live under src/components/ui.

Domain features live under src/features.

## State management

Backend entities must not be duplicated into Zustand.

TanStack Query keys must include relevant tenant and event context.

Authentication transitions must clear account-specific cached data.

## Routing

Organization slugs are used for organization URLs.

Event slugs are scoped to organizations.

Immutable IDs remain the backend resource identifiers.

Organization pages use AppLayout.

Speaker pages use SpeakerLayout.

## Security

Frontend route guards are not authorization boundaries.

The backend must validate tenant membership, resource ownership and permissions.

No secrets may be exposed through VITE\_ variables.

## UI components

Components initially live in apps/web.

Shared UI extraction is deferred until another application requires the same component system.

## Consequences

- Independent feature development
- Consistent application composition
- Centralized server-state management
- Accessible UI primitives
- Lazy-loaded feature routes
- Additional dependency and configuration maintenance

## Follow-up

- Authentication and account activation
- Organization onboarding
- API client integration
- Shared UI extraction
- End-to-end testing
- Production observability
