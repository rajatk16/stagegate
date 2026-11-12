import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

import ts from 'typescript';

const repositoryRoot = resolve(import.meta.dirname, '../..');

const configDirectory = join(repositoryRoot, 'packages/typescript-config');

function readConfig(name) {
  const configPath = join(configDirectory, name);

  const config = ts.readConfigFile(configPath, ts.sys.readFile);

  assert.equal(config.error, undefined);

  return ts.parseJsonConfigFileContent(
    config.config,

    ts.sys,

    configDirectory,

    undefined,

    configPath,
  );
}

function compileSource(context, source, configName = 'library.json') {
  const directory = mkdtempSync(join(tmpdir(), 'stagegate-typescript-'));

  context.after(() => {
    rmSync(directory, {
      recursive: true,
      force: true,
    });
  });

  const sourcePath = join(directory, 'index.ts');

  writeFileSync(
    join(directory, 'package.json'),

    JSON.stringify({
      type: 'module',
    }),

    'utf8',
  );

  writeFileSync(sourcePath, source, 'utf8');

  const config = readConfig(configName);

  const program = ts.createProgram(
    [sourcePath],

    {
      ...config.options,

      noEmit: true,
    },
  );

  return ts.getPreEmitDiagnostics(program);
}

test('all shared TypeScript configurations parse successfully', () => {
  const configurations = [
    'base.json',
    'react.json',
    'node.json',
    'nest.json',
    'library.json',
    'react-library.json',
    'node-library.json',
  ];

  for (const name of configurations) {
    const config = readConfig(name);

    const errors = config.errors.filter((error) => error.code !== 18003);

    assert.deepEqual(errors, [], `Invalid configuration: ${name}`);
  }
});

test('base configuration enables strict checking', () => {
  const { options } = readConfig('base.json');

  assert.equal(options.strict, true);

  assert.equal(options.noUncheckedIndexedAccess, true);

  assert.equal(options.exactOptionalPropertyTypes, true);

  assert.equal(options.noImplicitOverride, true);
});

test('React configuration uses bundler resolution', () => {
  const { options } = readConfig('react.json');

  assert.equal(options.moduleResolution, ts.ModuleResolutionKind.Bundler);

  assert.equal(options.jsx, ts.JsxEmit.ReactJSX);

  assert.equal(options.noEmit, true);

  assert.deepEqual(options.types, []);
});

test('Node configuration uses NodeNext resolution', () => {
  const { options } = readConfig('node.json');

  assert.equal(options.module, ts.ModuleKind.NodeNext);

  assert.equal(options.moduleResolution, ts.ModuleResolutionKind.NodeNext);

  assert.deepEqual(options.types, ['node']);
});

test('NestJS configuration supports decorator metadata', () => {
  const { options } = readConfig('nest.json');

  assert.equal(options.experimentalDecorators, true);

  assert.equal(options.emitDecoratorMetadata, true);

  assert.equal(options.verbatimModuleSyntax, false);
});

test('library configuration generates declarations', () => {
  const { options } = readConfig('library.json');

  assert.equal(options.declaration, true);

  assert.equal(options.declarationMap, true);

  assert.deepEqual(options.types, []);
});

test('valid TypeScript source compiles', (context) => {
  const diagnostics = compileSource(
    context,

    `
        export interface Proposal {
          id: string;
          title: string;
        }

        export const proposal: Proposal = {
          id: 'proposal-1',
          title: 'Building reliable SaaS platforms',
        };
      `,
  );

  assert.deepEqual(diagnostics, []);
});

test('rejects implicit any parameters', (context) => {
  const diagnostics = compileSource(
    context,

    `
        export function getProposalId(proposal) {
          return proposal.id;
        }
      `,
  );

  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 7006));
});

test('rejects unsafe indexed access', (context) => {
  const diagnostics = compileSource(
    context,

    `
        const proposals: string[] = [];

        export const firstProposal: string =
          proposals[0];
      `,
  );

  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2322));
});

test('rejects explicit undefined for exact optional properties', (context) => {
  const diagnostics = compileSource(
    context,

    `
        interface Proposal {
          description?: string;
        }

        export const proposal: Proposal = {
          description: undefined,
        };
      `,
  );

  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2375));
});

test('runtime-neutral libraries cannot use browser globals', (context) => {
  const diagnostics = compileSource(
    context,

    `
        export const element = document.body;
      `,
  );

  assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2584 || diagnostic.code === 2304));
});

test('runtime-neutral libraries cannot use Node globals', (context) => {
  const diagnostics = compileSource(
    context,

    `
        export const environment =
          process.env.NODE_ENV;
      `,
  );

  assert.ok(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.code === 2591 || diagnostic.code === 2580 || diagnostic.code === 2304,
    ),
  );
});
