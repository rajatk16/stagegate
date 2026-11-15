# StageGate Firebase Infrastructure

This directory owns the Firebase Emulator Suite configuration, Firestore rules and indexes.

## Project

Local development uses:

demo-stagegate

Never change the default project to a production Firebase project.

## Start

From the repository root:

```bash
npm run firebase:emulators
```

## Ports

| Service | Port |
| --- | --- |
| Firestore | 8080 |
| Authentication | 9099 |
| Emulator UI | 4001 |
| Emulator Hub | 4400 |
| Emulator logging | 4500 |

## Tests

```bash
npm run firebase:test
```

## Security rules

All direct Firestore client access is denied.

The StageGate backend accesses Firestore through the Firebase Admin SDK.

## Production deployment

Production Firebase resources and IAM will be managed separately.

Do not deploy this local configuration to a production project without an explicit review.
