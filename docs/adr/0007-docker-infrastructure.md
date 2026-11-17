# ADR 0007: Docker Infrastructure

## Status

Proposed

## Context

StageGate is a Turborepo monorepo containing React applications, a NestJS API and shared TypeScript packages.

Local development requires Node.js, npm, Firebase CLI and Java.

Manually installing these dependencies creates environment inconsistencies across developers and CI systems.

## Decision

Use Docker and Docker Compose to provide reproducible development environments.

Maintain separate development and production container configurations.

## Development

Use a shared development image containing all npm workspaces and development dependencies.

Run three services:

- React frontend
- NestJS API
- Firebase Emulator Suite

Use Docker Compose Watch for source synchronization and hot reload.

Rebuild shared packages when their source changes.

## Production

Use multi-stage Docker builds.

Use Turborepo pruning to reduce the workspace dependency graph.

Run compiled NestJS code in a Node.js image.

Serve compiled React assets using an unprivileged Nginx image.

Do not include Firebase emulators in production.

## Networking

Development browsers access published localhost ports.

Containers communicate using Compose service hostnames.

Production frontend requests use same-origin API routing through Nginx.

## Security

Run application containers as non-root users.

Restrict production container capabilities.

Use read-only production filesystems.

Do not embed cloud credentials in images.

Use Application Default Credentials through the deployment platform.

## Persistence

Use named Docker volumes for Firebase emulator exports and emulator binary caches.

## Health

Use container health checks to detect service availability.

Use the existing NestJS readiness endpoint to verify Firebase dependencies.

## Consequences

- Reproducible development environments
- Reduced host dependency requirements
- Consistent container build workflows
- Smaller production images
- Explicit service networking
- Improved deployment portability

## Limitations

Docker Compose does not provide highly available production orchestration.

Emulator persistence depends on successful exports.

Shared package changes restart development containers.

Production resource limits require load testing.

Base image digests must be pinned for fully reproducible production builds.

## Follow-up

- Isolated integration test environments
- GitHub Actions container builds
- Container vulnerability scanning
- Software bills of materials
- Production workload identity
- Terraform deployment infrastructure
- Centralized observability
