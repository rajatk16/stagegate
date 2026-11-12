import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

import { ESLint } from 'eslint';

import { baseConfig, prettierConfig } from '@stagegate/eslint-config/base';
import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';
import { createTypeScriptConfig } from '@stagegate/eslint-config/typescript';

const repositoryRoot = resolve(import.meta.dirname, '../..');

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

function createRepository(context) {
  const root = mkdtempSync(join(tmpdir(), 'stagegate-eslint-'));

  context.after(() => {
    rmSync(root, {
      recursive: true,
      force: true,
    });
  });

  mkdirSync(join(root, 'apps'));

  mkdirSync(join(root, 'packages'));

  writeJson(
    join(root, 'package.json'),

    {
      name: 'stagegate',
      private: true,
      type: 'module',

      workspaces: ['apps/*', 'packages/*'],
    },
  );

  return root;
}

function createWorkspace(root, group, name, overrides = {}) {
  const directory = join(root, group, name);

  mkdirSync(
    join(directory, 'src'),

    {
      recursive: true,
    },
  );

  writeJson(
    join(directory, 'package.json'),

    {
      name: `@stagegate/${name}`,
      version: '0.0.0',
      private: true,
      type: 'module',
      ...overrides,
    },
  );

  return directory;
}

async function lintSource({ cwd, filePath, source, config }) {
  const eslint = new ESLint({
    cwd,

    overrideConfigFile: true,

    overrideConfig: config,
  });

  const [result] = await eslint.lintText(
    source,

    {
      filePath,
    },
  );

  return result.messages;
}

async function lintBoundary(root, workspace, source, browser = false) {
  return lintSource({
    cwd: workspace,

    filePath: join(workspace, 'src/index.js'),

    source,

    config: [
      ...baseConfig,

      ...createBoundaryConfig({
        repositoryRoot: root,

        workspaceRoot: workspace,

        browser,
      }),

      prettierConfig,
    ],
  });
}

function hasRule(messages, ruleId) {
  return messages.some((message) => message.ruleId === ruleId);
}

function hasBoundaryError(messages, messageId) {
  return messages.some(
    (message) => message.ruleId === 'stagegate/enforce-imports' && message.messageId === messageId,
  );
}

test('base configuration rejects var', async () => {
  const messages = await lintSource({
    cwd: repositoryRoot,

    filePath: 'example.mjs',

    source: `
        var proposal = 'test';
        export { proposal };
      `,

    config: [...baseConfig, prettierConfig],
  });

  assert.ok(hasRule(messages, 'no-var'));
});

test('base configuration rejects debugger', async () => {
  const messages = await lintSource({
    cwd: repositoryRoot,

    filePath: 'example.mjs',

    source: 'debugger;',

    config: [...baseConfig, prettierConfig],
  });

  assert.ok(hasRule(messages, 'no-debugger'));
});

test('TypeScript configuration rejects explicit any', async (context) => {
  const root = createRepository(context);

  const workspace = createWorkspace(root, 'packages', 'example');

  writeJson(
    join(workspace, 'tsconfig.json'),

    {
      compilerOptions: {
        strict: true,
        target: 'ES2022',
        module: 'NodeNext',
      },

      include: ['src/**/*.ts'],
    },
  );

  const messages = await lintSource({
    cwd: workspace,

    filePath: join(workspace, 'src/index.ts'),

    source: `
        export const proposal: any = {};
      `,

    config: [
      ...createTypeScriptConfig({
        tsconfigRootDir: workspace,
        typeChecked: false,
      }),

      prettierConfig,
    ],
  });

  assert.ok(hasRule(messages, '@typescript-eslint/no-explicit-any'));
});

test('type-aware linting rejects floating promises', async (context) => {
  const root = createRepository(context);

  const workspace = createWorkspace(root, 'packages', 'example');

  writeJson(
    join(workspace, 'tsconfig.json'),

    {
      compilerOptions: {
        strict: true,
        target: 'ES2022',
        module: 'NodeNext',
      },

      include: ['src/**/*.ts'],
    },
  );

  const source = `
      function saveProposal(): Promise<void> {
        return Promise.resolve();
      }

      saveProposal();
    `;

  const filePath = join(workspace, 'src/index.ts');

  writeFileSync(filePath, source, 'utf8');

  const messages = await lintSource({
    cwd: workspace,

    filePath,

    source,

    config: [
      ...createTypeScriptConfig({
        tsconfigRootDir: workspace,
      }),

      prettierConfig,
    ],
  });

  assert.ok(hasRule(messages, '@typescript-eslint/no-floating-promises'));
});

test('allows declared shared package imports', async (context) => {
  const root = createRepository(context);

  createWorkspace(root, 'packages', 'contracts');

  const web = createWorkspace(
    root,
    'apps',
    'web',

    {
      dependencies: {
        '@stagegate/contracts': '*',
      },
    },
  );

  const messages = await lintBoundary(root, web, "import '@stagegate/contracts';", true);

  assert.equal(hasRule(messages, 'stagegate/enforce-imports'), false);
});

test('rejects undeclared internal dependencies', async (context) => {
  const root = createRepository(context);

  createWorkspace(root, 'packages', 'contracts');

  const web = createWorkspace(root, 'apps', 'web');

  const messages = await lintBoundary(root, web, "import '@stagegate/contracts';");

  assert.ok(hasBoundaryError(messages, 'undeclaredDependency'));
});

test('rejects unknown internal packages', async (context) => {
  const root = createRepository(context);

  const web = createWorkspace(root, 'apps', 'web');

  const messages = await lintBoundary(root, web, "import '@stagegate/missing';");

  assert.ok(hasBoundaryError(messages, 'unknownWorkspace'));
});

test('rejects application imports', async (context) => {
  const root = createRepository(context);

  createWorkspace(root, 'apps', 'api');

  const web = createWorkspace(
    root,
    'apps',
    'web',

    {
      dependencies: {
        '@stagegate/api': '*',
      },
    },
  );

  const messages = await lintBoundary(root, web, "import '@stagegate/api';");

  assert.ok(hasBoundaryError(messages, 'applicationImport'));
});

test('rejects cross-workspace relative imports', async (context) => {
  const root = createRepository(context);

  createWorkspace(root, 'apps', 'api');

  const web = createWorkspace(root, 'apps', 'web');

  const messages = await lintBoundary(root, web, "import '../../api/src/main.js';");

  assert.ok(hasBoundaryError(messages, 'crossWorkspace'));
});

test('rejects private package subpaths', async (context) => {
  const root = createRepository(context);

  createWorkspace(
    root,
    'packages',
    'contracts',

    {
      exports: {
        '.': './dist/index.js',
      },
    },
  );

  const web = createWorkspace(
    root,
    'apps',
    'web',

    {
      dependencies: {
        '@stagegate/contracts': '*',
      },
    },
  );

  const messages = await lintBoundary(root, web, "import '@stagegate/contracts/src/internal.js';");

  assert.ok(hasBoundaryError(messages, 'privateSubpath'));
});

test('allows explicitly exported package subpaths', async (context) => {
  const root = createRepository(context);

  createWorkspace(
    root,
    'packages',
    'contracts',

    {
      exports: {
        '.': './dist/index.js',
        './errors': './dist/errors.js',
      },
    },
  );

  const web = createWorkspace(
    root,
    'apps',
    'web',

    {
      dependencies: {
        '@stagegate/contracts': '*',
      },
    },
  );

  const messages = await lintBoundary(root, web, "import '@stagegate/contracts/errors';");

  assert.equal(hasRule(messages, 'stagegate/enforce-imports'), false);
});

test('rejects server-only packages in browser workspaces', async (context) => {
  const root = createRepository(context);

  createWorkspace(
    root,
    'packages',
    'example-server',

    {
      stagegate: {
        runtime: 'server',
      },
    },
  );

  const web = createWorkspace(
    root,
    'apps',
    'web',

    {
      dependencies: {
        '@stagegate/example-server': '*',
      },
    },
  );

  const messages = await lintBoundary(root, web, "import '@stagegate/example-server';", true);

  assert.ok(hasBoundaryError(messages, 'serverOnly'));
});

test('allows server-only packages in server workspaces', async (context) => {
  const root = createRepository(context);

  createWorkspace(
    root,
    'packages',
    'logger',

    {
      stagegate: {
        runtime: 'server',
      },
    },
  );

  const api = createWorkspace(
    root,
    'apps',
    'api',

    {
      dependencies: {
        '@stagegate/logger': '*',
      },
    },
  );

  const messages = await lintBoundary(root, api, "import '@stagegate/logger';");

  assert.equal(hasRule(messages, 'stagegate/enforce-imports'), false);
});

test('rejects non-static dynamic imports', async (context) => {
  const root = createRepository(context);

  const web = createWorkspace(root, 'apps', 'web');

  const messages = await lintBoundary(
    root,
    web,

    `
        export function loadModule(name) {
          return import(name);
        }
      `,
  );

  assert.ok(hasBoundaryError(messages, 'dynamicImport'));
});
