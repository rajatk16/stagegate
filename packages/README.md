# Shared Packages

This directory contains reusable internal
StageGate libraries and tooling configurations.

## Naming

Every workspace must use the following namespace:

@stagegate/<package-name>

## Package rules

1. All packages must be private.
2. Packages must declare their direct dependencies.
3. Packages must not depend on applications.
4. Circular workspace dependencies are prohibited.
5. Public package entry points must use explicit exports.
6. Consumers must not import another package's
   internal source files.
7. Browser-compatible packages must not import
   server-only dependencies.
8. Packages must not contain environment secrets.

## Planned packages

| Package | Responsibility |
| --- | --- |
| contracts | Shared API contracts |
| ui | Shared React components |
| api-client | API communication |
| auth | Authentication utilities |
| permissions | Authorization contracts |
| validation | Shared validation schemas |
| config | Configuration utilities |
| logger | Structured logging |
| observability | Telemetry utilities |
| email-templates | Email templates |
| test-utils | Shared testing utilities |
| eslint-config | ESLint configuration |
| typescript-config | TypeScript configuration |

Packages should be created only when their
implementation is required.
