import assert from 'node:assert/strict';

import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';

import {
  tmpdir,
} from 'node:os';

import {
  join,
} from 'node:path';

import {
  test,
} from 'node:test';

import {
  findDependencyCycles,
  getInternalDependencies,
  validateWorkspaces,
} from '../lib/workspace-validation.mjs';

/**
 * Create an isolated temporary monorepo.
 *
 * @param {import('node:test').TestContext} context
 */
function createRepository(context) {
  const root = mkdtempSync(
    join(tmpdir(), 'stagegate-test-'),
  );

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
      workspaces: [
        'apps/*',
        'packages/*',
      ],
    },
  );

  return root;
}

function writeJson(filePath, data) {
  writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

function createWorkspace(
  root,
  group,
  name,
  overrides = {},
) {
  const directory = join(
    root,
    group,
    name,
  );

  mkdirSync(directory, {
    recursive: true,
  });

  writeJson(
    join(directory, 'package.json'),
    {
      name: `@stagegate/${name}`,
      version: '0.0.0',
      private: true,
      ...overrides,
    },
  );

  return directory;
}

test(
  'accepts a valid workspace structure',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'packages',
      'contracts',
    );

    createWorkspace(
      root,
      'apps',
      'api',
      {
        dependencies: {
          '@stagegate/contracts': '*',
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, true);

    assert.deepEqual(result.errors, []);

    assert.deepEqual(result.workspaces, [
      '@stagegate/api',
      '@stagegate/contracts',
    ]);
  },
);

test(
  'rejects non-private root packages',
  (context) => {
    const root = createRepository(context);

    writeJson(
      join(root, 'package.json'),
      {
        name: 'stagegate',
        private: false,
        workspaces: [
          'apps/*',
          'packages/*',
        ],
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'Root package must be private',
        ),
      ),
    );
  },
);

test(
  'rejects non-private workspaces',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'apps',
      'web',
      {
        private: false,
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'workspace must be private',
        ),
      ),
    );
  },
);

test(
  'rejects invalid workspace names',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'apps',
      'web',
      {
        name: 'web',
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'expected package name',
        ),
      ),
    );
  },
);

test(
  'rejects duplicate workspace names',
  (context) => {
    const root = createRepository(context);

    createWorkspace(root, 'apps', 'shared');
    createWorkspace(root, 'packages', 'shared');

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'Duplicate workspace name',
        ),
      ),
    );
  },
);

test(
  'rejects workspace-level lockfiles',
  (context) => {
    const root = createRepository(context);

    const directory = createWorkspace(
      root,
      'apps',
      'web',
    );

    writeJson(
      join(directory, 'package-lock.json'),
      {},
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'unexpected workspace lockfile',
        ),
      ),
    );
  },
);

test(
  'rejects alternative root lockfiles',
  (context) => {
    const root = createRepository(context);

    writeFileSync(
      join(root, 'pnpm-lock.yaml'),
      'lockfileVersion: 9',
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'Unexpected root lockfile',
        ),
      ),
    );
  },
);

test(
  'rejects missing workspace manifests',
  (context) => {
    const root = createRepository(context);

    mkdirSync(
      join(root, 'apps', 'web'),
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'Missing package.json',
        ),
      ),
    );
  },
);

test(
  'rejects unknown internal dependencies',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'apps',
      'web',
      {
        dependencies: {
          '@stagegate/missing': '*',
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'unknown internal dependency',
        ),
      ),
    );
  },
);

test(
  'rejects application-to-application dependencies',
  (context) => {
    const root = createRepository(context);

    createWorkspace(root, 'apps', 'api');

    createWorkspace(
      root,
      'apps',
      'web',
      {
        dependencies: {
          '@stagegate/api': '*',
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'dependencies on application',
        ),
      ),
    );
  },
);

test(
  'rejects package-to-application dependencies',
  (context) => {
    const root = createRepository(context);

    createWorkspace(root, 'apps', 'api');

    createWorkspace(
      root,
      'packages',
      'contracts',
      {
        dependencies: {
          '@stagegate/api': '*',
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'dependencies on application',
        ),
      ),
    );
  },
);

test(
  'rejects inconsistent internal dependency versions',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'packages',
      'contracts',
    );

    createWorkspace(
      root,
      'apps',
      'api',
      {
        dependencies: {
          '@stagegate/contracts': '^1.0.0',
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes('must use "*"'),
      ),
    );
  },
);

test(
  'rejects malformed dependency declarations',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'apps',
      'api',
      {
        dependencies: {
          react: 19,
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'dependencies.react must be a string',
        ),
      ),
    );
  },
);

test(
  'rejects circular package dependencies',
  (context) => {
    const root = createRepository(context);

    createWorkspace(
      root,
      'packages',
      'first',
      {
        dependencies: {
          '@stagegate/second': '*',
        },
      },
    );

    createWorkspace(
      root,
      'packages',
      'second',
      {
        dependencies: {
          '@stagegate/first': '*',
        },
      },
    );

    const result = validateWorkspaces(root);

    assert.equal(result.valid, false);

    assert.ok(
      result.errors.some((error) =>
        error.includes(
          'Circular workspace dependency',
        ),
      ),
    );
  },
);

test(
  'collects internal dependencies from all dependency fields',
  () => {
    const result = getInternalDependencies({
      dependencies: {
        '@stagegate/contracts': '*',
        react: '19.0.0',
      },
      devDependencies: {
        '@stagegate/test-utils': '*',
      },
      peerDependencies: {
        '@stagegate/ui': '*',
      },
      optionalDependencies: {
        '@stagegate/logger': '*',
      },
    });

    assert.equal(result.length, 4);

    assert.deepEqual(
      result.map((dependency) => dependency.name),
      [
        '@stagegate/contracts',
        '@stagegate/test-utils',
        '@stagegate/ui',
        '@stagegate/logger',
      ],
    );
  },
);

test(
  'accepts an acyclic dependency graph',
  () => {
    const graph = new Map([
      ['web', new Set(['client'])],
      ['client', new Set(['contracts'])],
      ['contracts', new Set()],
    ]);

    assert.deepEqual(
      findDependencyCycles(graph),
      [],
    );
  },
);

test(
  'detects self-referencing dependencies',
  () => {
    const graph = new Map([
      ['contracts', new Set(['contracts'])],
    ]);

    const errors = findDependencyCycles(graph);

    assert.equal(errors.length, 1);

    assert.match(
      errors[0],
      /contracts -> contracts/,
    );
  },
);
