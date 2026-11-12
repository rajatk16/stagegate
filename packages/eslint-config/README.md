# @stagegate/eslint-config

Shared ESLint flat configurations for StageGate.

## Available configurations

- base
- typescript
- react
- node
- boundaries

## React application usage

```javascript
import { resolve } from 'node:path';

import { prettierConfig } from '@stagegate/eslint-config/base';

import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';

import { createReactConfig } from '@stagegate/eslint-config/react';

export default [
  ...createReactConfig({
    tsconfigRootDir: import.meta.dirname,
  }),

  ...createBoundaryConfig({
    repositoryRoot: resolve(import.meta.dirname, '../..'),
    workspaceRoot: import.meta.dirname,
    browser: true,
  }),

  prettierConfig,
];
```

## Rules

- ESLint flat configuration is mandatory.
- Type-aware linting is enabled for application source.
- React Hooks violations are errors.
- Accessibility violations are errors.
- Cross-workspace relative imports are prohibited.
- Application-to-application imports are prohibited.
- Internal package dependencies must be declared.
- Internal package subpaths must be explicitly exported.
- Browser code cannot import server-only packages.
- Prettier compatibility configuration must be applied last.

## Suppressions

ESLint suppressions must be narrow and documented.

Do not disable an entire rule set to resolve a single
implementation issue.

## NestJS

NestJS configurations disable automatic type-import
enforcement in application source because decorator
metadata can require runtime value imports.
