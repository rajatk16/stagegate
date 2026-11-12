# ADR 0001: Adopt Turborepo and npm Workspaces

## Status

Accepted

## Context

StageGate is a multi-tenant SaaS platform consisting
of multiple deployable applications and shared
internal packages.

The platform requires consistent development tooling,
shared API contracts, coordinated changes, dependency
management and efficient build orchestration.

Maintaining separate repositories would introduce
additional dependency publishing, version coordination
and integration overhead.

## Decision

StageGate will use a monorepo managed by Turborepo
and npm workspaces.

The repository will contain:

- apps/web
- apps/api
- apps/worker
- apps/admin
- packages/*
- infrastructure/*
- docs/*
- scripts/*

## Package management

npm is the only supported package manager.

A single package-lock.json will be maintained at
the repository root.

Internal packages will use the @stagegate namespace.

All workspaces will be private.

Internal workspace dependencies will use the "*"
version specification.

External dependencies will use exact versions.

## Dependency boundaries

Applications may depend on shared packages.

Shared packages may depend on other shared packages.

Applications must not depend on other applications.

Shared packages must not depend on applications.

Circular dependencies are prohibited.

## Task orchestration

Turborepo will orchestrate:

- Development
- Builds
- Linting
- Type checking
- Unit tests
- Integration tests
- End-to-end tests

Deterministic tasks may use caching.

Long-running development processes and tests
that depend on external runtime state will not
be cached.

## Alternatives considered

### Multiple repositories

Rejected because shared contracts and coordinated
feature changes would require additional
cross-repository release management.

### Nx

Considered but not selected because Turborepo
provides the required task orchestration with
a smaller initial configuration surface.

### pnpm workspaces

Considered but not selected because npm workspaces
meet the current project requirements.

## Consequences

### Positive

- Atomic cross-application changes
- Centralized dependency management
- Shared engineering conventions
- Dependency-aware task execution
- Build caching
- Simplified local development

### Negative

- Repository-wide lockfile changes
- Increased importance of dependency boundaries
- Potential dependency hoisting issues
- Shared CI infrastructure requires careful design

## Follow-up decisions

- TypeScript compilation strategy
- Shared package export strategy
- Frontend application architecture
- Backend module architecture
- Database architecture
- Remote caching
- CI/CD deployment strategy
