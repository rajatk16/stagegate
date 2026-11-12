# Getting Started with StageGate

## Prerequisites

- Node.js 24 LTS
- npm 11.19.0
- Git
- A compatible code editor

## Runtime setup

Using nvm:

```bash
nvm install
nvm use
```

Install the expected npm version:

```bash
npm install --global npm@11.19.0
```

Verify:

```bash
node --version
npm --version
```

## Install dependencies

From the repository root:

```bash
npm ci
```

Do not install dependencies independently inside
individual workspaces.

## Validate the repository

```bash
npm run validate:workspaces
npm run test:foundation
```

## Inspect Turborepo

```bash
npm run info
```

## Workspace commands

Run a command in a specific workspace:

```bash
npm run <script> --workspace=@stagegate/web
```

Install a dependency in a workspace:

```bash
npm install <package> --workspace=@stagegate/web
```

Install a development dependency:

```bash
npm install --save-dev <package> \
  --workspace=@stagegate/web
```

## Cleanup

Preview generated files:

```bash
npm run clean -- --dry-run
```

Remove generated files:

```bash
npm run clean
```

Perform a full dependency cleanup:

```bash
npm run clean -- --all
npm ci
```

## Environment variables

Application-specific environment variables must
be documented in the application's .env.example.

Actual environment files must never be committed.

## Verify the repository

```bash
npm run validate:workspaces
npm run test:foundation
npm run lint
npm run typecheck
npm run format:check
```

Run the complete quality gate:

```bash
npm run check
```

## Formatting

Format the repository:

```bash
npm run format
```

Apply ESLint autofixes:

```bash
npm run lint:fix
```

Review all generated changes before committing.

## Current project status

Phase 1, PR 1.2 introduces shared TypeScript,
ESLint and Prettier configurations.

Application workspaces have compiler and lint
configurations but do not yet contain runnable
applications.

Type checking validates configuration and skips
compilation for empty application workspaces.

React and NestJS initialization will follow.
