# StageGate Firebase Development

## Prerequisites

- Repository-pinned Node.js and npm versions
- Java 21
- Root npm dependencies installed

## Environment

Copy or merge the API environment example.

```bash
cp -n apps/api/.env.example apps/api/.env.local
```

Development must use the demo-stagegate project.

## Start Firebase

```bash
npm run firebase:emulators
```

## Start StageGate

```bash
npm run dev
```

## Local endpoints

- Firebase UI: http://localhost:4001
- Firestore: 127.0.0.1:8080
- Firebase Auth: 127.0.0.1:9099
- API: http://localhost:4000

## Persistent emulator data

Export data from running emulators:

```bash
npm run firebase:export
```

Restore and persist emulator data:

```bash
npm run firebase:emulators:seeded
```

Emulator exports must not be committed.

## Automated tests

Stop existing emulator processes.

```bash
npm run firebase:test
```

## Complete verification

```bash
npm run check:infrastructure
```

## Security

Never use real Firebase projects in local development or automated tests.

Never commit service account credentials.

Do not initialize Firebase independently inside business modules.

Import FirebaseModule and inject the required SDK provider.

All direct client Firestore access is denied.

## Health endpoints

- GET /health/live
- GET /health/ready

Readiness depends on Firebase availability.

Liveness does not depend on Firebase.

## Production

Use Application Default Credentials with an authorized runtime service account.

Use dedicated Firebase projects per environment.

Do not configure emulator environment variables in cloud deployments.
