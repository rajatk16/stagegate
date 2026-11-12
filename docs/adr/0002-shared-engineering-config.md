# ADR 0002: Centralize Engineering Configurations

## Status

Proposed

## Context

StageGate contains multiple applications and shared
packages within a single monorepo.

Independent TypeScript, ESLint and formatting
configurations would introduce inconsistent behavior,
duplicated configuration and architectural drift.

## Decision

Create two internal configuration packages:

- @stagegate/typescript-config
- @stagegate/eslint-config

Maintain a single Prettier configuration at the
repository root.

## TypeScript

Strict TypeScript checking is mandatory.

Separate configurations will support:

- Browser applications
- Node.js applications
- NestJS applications
- Runtime-neutral libraries
- React libraries
- Server-side libraries

Browser applications use bundler module resolution.

Node.js applications and compiled libraries use
NodeNext module resolution.

The NestJS application initially uses CommonJS output.

## ESLint

ESLint flat configuration is mandatory.

Type-aware TypeScript linting is enabled for
application and library source files.

React Hooks and accessibility rules are enforced.

Workspace boundaries are enforced at both manifest
and source-code levels.

## Formatting

Prettier is the sole formatting engine.

Formatting rules must not be duplicated in ESLint.

## Dependency boundaries

- Applications may import shared packages.
- Shared packages may import other shared packages.
- Applications may not import other applications.
- Cross-workspace relative imports are prohibited.
- Internal dependencies must be declared.
- Internal subpaths must be explicitly exported.
- Browser code may not import server-only packages.

## Alternatives considered

### Independent workspace configurations

Rejected because they increase maintenance overhead
and introduce inconsistent engineering standards.

### ESLint formatting rules

Rejected in favor of a dedicated formatting engine.

### A single TypeScript configuration

Rejected because browser applications and Node.js
services have different runtime requirements.

## Consequences

### Positive

- Consistent engineering standards
- Centralized configuration maintenance
- Safer TypeScript code
- Improved architectural boundaries
- Consistent formatting
- Earlier detection of programming errors

### Negative

- Type-aware linting increases lint execution time.
- Strict compiler settings require explicit handling
  of nullability and optional properties.
- Configuration changes can invalidate multiple
  workspace caches.

## Follow-up

- Vite-specific configuration
- React Fast Refresh linting
- Tailwind CSS formatting
- NestJS-specific lint exceptions
- Transitive runtime dependency validation
- CI integration
