# StageGate

From Call for Papers to Conference Stage.

StageGate is a multi-tenant SaaS platform for
conference proposal submission, review, selection
and speaker management.

## Product capabilities

- Organization management
- Event management
- Call for Papers management
- Speaker profiles
- Proposal submissions
- Reviewer assignments
- Configurable scoring rubrics
- Blind reviews
- Program committee collaboration
- Decision management
- Speaker communication
- Conference scheduling
- Analytics
- SaaS subscriptions

## Technology stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Monorepo        | Turborepo               |
| Package manager | npm workspaces          |
| Language        | TypeScript              |
| Frontend        | React                   |
| Backend         | NestJS                  |
| Authentication  | Firebase Authentication |
| Database        | Cloud Firestore         |
| Background jobs | BullMQ                  |
| Cache           | Redis                   |

## Repository structure

```text
stagegate/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── admin/
├── packages/
│   └── contracts/
├── infrastructure/
├── docs/
└── scripts/
```

## Prerequisites

- Node.js 24 LTS
- npm 11.19.0
- Git

## Getting started

```bash
nvm install
nvm use

npm install --global npm@11.19.0

npm ci
```

## Verify the repository

```bash
npm run check
```

Individual checks:

```bash
npm run validate:workspaces
npm run test:foundation
npm run lint
npm run typecheck
npm run format:check
```

## Applications

| Application | Workspace         |
| ----------- | ----------------- |
| Web         | @stagegate/web    |
| API         | @stagegate/api    |
| Worker      | @stagegate/worker |
| Admin       | @stagegate/admin  |

## Shared packages

| Package                  | Workspace                    |
| ------------------------ | ---------------------------- |
| API contracts            | @stagegate/contracts         |
| TypeScript configuration | @stagegate/typescript-config |
| ESLint configuration     | @stagegate/eslint-config     |

## Development status

Phase 1: Engineering Foundation

- [x] Monorepo foundation
- [x] Shared engineering configurations
- [x] React application foundation
- [ ] NestJS application foundation
- [ ] Firebase integration
- [ ] Shared API contracts
- [ ] Docker infrastructure
- [ ] Testing infrastructure
- [ ] CI/CD
- [ ] Observability

The registered application workspaces are not
yet runnable.

## Documentation

- [Getting Started](docs/development/getting-started.md)
- [Monorepo Architecture](docs/adr/0001-monorepo-architecture.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

Proprietary. All rights reserved.
