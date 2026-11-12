# @stagegate/contracts

Shared API contracts for StageGate applications.

## Responsibilities

- Request contracts
- Response contracts
- Shared domain types
- Error codes
- Pagination contracts
- Public API schemas

## Consumers

- @stagegate/web
- @stagegate/api
- @stagegate/admin
- @stagegate/worker
- @stagegate/api-client

## Rules

- Must remain framework-independent.
- Must not import application code.
- Must not contain secrets.
- Must not depend on Firebase Admin SDK.
- Must not contain persistence implementations.
- Must not expose internal database entities
  as public API contracts.

## Status

Workspace registered.

Implementation is scheduled for
Phase 1, PR 1.6.
