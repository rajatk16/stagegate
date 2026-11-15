# ADR 0005: Firebase Infrastructure

## Status

Proposed

## Context

StageGate requires persistent application storage and authentication identity management.

The backend must support safe local development, automated testing and cloud deployment.

## Decision

Use Cloud Firestore for application persistence.

Use Firebase Auth for authentication identities.

Access Firebase exclusively through the NestJS Firebase infrastructure module.

Use a named Firebase Admin application with explicit lifecycle management.

Expose Firestore and Firebase Auth through typed NestJS dependency injection providers.

## Local development

Use Firebase Auth and Firestore emulators.

Require a demo Firebase project.

Restrict emulator endpoints to approved local addresses.

Reject real cloud configuration in development and automated tests.

## Production

Use Application Default Credentials.

Use a dedicated Firebase project per deployed environment.

Reject emulator configuration in cloud mode.

Do not commit service account credentials.

## Security

Deny all direct Firestore client access.

The Firebase Admin SDK bypasses security rules.

The backend is responsible for resource-level authorization and tenant isolation.

Firebase Auth identities do not directly determine StageGate application permissions.

## Health monitoring

Keep liveness independent of Firebase.

Include Firestore and Firebase Auth in readiness.

Cache dependency health results.

Deduplicate concurrent health operations.

Bound the readiness response waiting time.

## Testing

Mock Firebase in unit tests and general HTTP integration tests.

Use real Firebase emulators for infrastructure integration tests.

Use unique test resource identifiers and explicit cleanup.

## Consequences

- Safe local Firebase development
- Centralized Firebase configuration
- Predictable SDK lifecycle
- Explicit infrastructure dependencies
- Dependency-aware readiness
- Reduced accidental production access risk

## Limitations

Emulator behavior is not identical to cloud Firebase behavior.

Health check timeouts do not cancel underlying SDK operations.

Production IAM and deployment infrastructure remain separate implementation tasks.

Firestore data modeling and tenant isolation will be implemented alongside business modules.

## Follow-up

- Shared API contracts
- Docker emulator infrastructure
- Firebase identity verification
- Application user persistence
- Organization repositories
- Tenant authorization
- Production IAM
- Backup and disaster recovery
