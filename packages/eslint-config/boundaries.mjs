import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { defineConfig } from 'eslint/config';

import { sourceFiles } from './base.mjs';

const INTERNAL_NAMESPACE = '@stagegate/';

const SERVER_ONLY_PACKAGES = new Set([
  '@stagegate/logger',
  '@stagegate/observability',
  '@stagegate/server-config',
  '@stagegate/node-library',
  '@stagegate/test-utils',
]);

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

function readManifest(directory) {
  return JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
}

function isInside(parent, child) {
  const path = relative(parent, child);

  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function discoverWorkspaces(repositoryRoot) {
  const workspaces = new Map();

  for (const group of ['apps', 'packages']) {
    const groupDirectory = join(repositoryRoot, group);

    if (!existsSync(groupDirectory)) {
      continue;
    }

    for (const entry of readdirSync(groupDirectory, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue;
      }

      const directory = realpathSync(join(groupDirectory, entry.name));

      if (!existsSync(join(directory, 'package.json'))) {
        continue;
      }

      const manifest = readManifest(directory);

      workspaces.set(manifest.name, {
        group,
        directory,
        manifest,
      });
    }
  }

  return workspaces;
}

function getPackageName(specifier) {
  const parts = specifier.split('/');

  if (specifier.startsWith('@')) {
    return parts.slice(0, 2).join('/');
  }

  return parts[0];
}

function getDeclaredDependencies(manifest) {
  const dependencies = new Set();

  for (const field of DEPENDENCY_FIELDS) {
    for (const name of Object.keys(manifest[field] ?? {})) {
      dependencies.add(name);
    }
  }

  return dependencies;
}

function getStaticString(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked;
  }

  return undefined;
}

function createBoundaryPlugin({ repositoryRoot, workspaceRoot, browser }) {
  const canonicalRoot = realpathSync(repositoryRoot);

  const canonicalWorkspaceRoot = realpathSync(workspaceRoot);

  const manifest = readManifest(canonicalWorkspaceRoot);

  const workspaces = discoverWorkspaces(canonicalRoot);

  const declaredDependencies = getDeclaredDependencies(manifest);

  return {
    meta: {
      name: '@stagegate/workspace-boundaries',
      version: '0.0.0',
    },

    rules: {
      'enforce-imports': {
        meta: {
          type: 'problem',

          docs: {
            description: 'Enforce StageGate workspace import boundaries.',
          },

          schema: [],

          messages: {
            crossWorkspace:
              'Cross-workspace relative import "{{specifier}}" is prohibited. Use a declared package dependency.',

            outsideWorkspace: 'Import "{{specifier}}" escapes the current workspace.',

            unknownWorkspace: 'Unknown internal workspace "{{name}}".',

            applicationImport: 'Importing application "{{name}}" is prohibited.',

            undeclaredDependency:
              'Internal dependency "{{name}}" must be declared in package.json.',

            privateSubpath:
              'Import "{{specifier}}" is not an explicitly exported package entry point.',

            serverOnly: 'Browser code cannot import server-only package "{{name}}".',

            dynamicImport:
              'Non-static module imports cannot be checked against workspace boundaries.',
          },
        },

        create(context) {
          function checkImport(source) {
            if (!source) {
              return;
            }

            const specifier = getStaticString(source);

            if (typeof specifier !== 'string') {
              context.report({
                node: source,
                messageId: 'dynamicImport',
              });

              return;
            }

            if (specifier.startsWith('.') || isAbsolute(specifier)) {
              const targetPath = resolve(dirname(context.filename), specifier);

              if (isInside(canonicalWorkspaceRoot, targetPath)) {
                return;
              }

              const targetWorkspace = [...workspaces.values()].find((workspace) =>
                isInside(workspace.directory, targetPath),
              );

              context.report({
                node: source,

                messageId: targetWorkspace ? 'crossWorkspace' : 'outsideWorkspace',

                data: {
                  specifier,
                },
              });

              return;
            }

            if (!specifier.startsWith(INTERNAL_NAMESPACE)) {
              return;
            }

            const packageName = getPackageName(specifier);

            const target = workspaces.get(packageName);

            if (!target) {
              context.report({
                node: source,
                messageId: 'unknownWorkspace',
                data: {
                  name: packageName,
                },
              });

              return;
            }

            if (target.group === 'apps') {
              context.report({
                node: source,
                messageId: 'applicationImport',
                data: {
                  name: packageName,
                },
              });

              return;
            }

            if (packageName !== manifest.name && !declaredDependencies.has(packageName)) {
              context.report({
                node: source,
                messageId: 'undeclaredDependency',
                data: {
                  name: packageName,
                },
              });

              return;
            }

            if (
              browser &&
              (SERVER_ONLY_PACKAGES.has(packageName) ||
                target.manifest.stagegate?.runtime === 'server')
            ) {
              context.report({
                node: source,
                messageId: 'serverOnly',
                data: {
                  name: packageName,
                },
              });

              return;
            }

            if (specifier !== packageName) {
              const subpath = `.${specifier.slice(packageName.length)}`;

              const exports = target.manifest.exports;

              const explicitlyExported =
                exports !== null &&
                typeof exports === 'object' &&
                !Array.isArray(exports) &&
                Object.hasOwn(exports, subpath) &&
                exports[subpath] !== null;

              if (!explicitlyExported) {
                context.report({
                  node: source,
                  messageId: 'privateSubpath',
                  data: {
                    specifier,
                  },
                });
              }
            }
          }

          return {
            ImportDeclaration(node) {
              checkImport(node.source);
            },

            ExportNamedDeclaration(node) {
              if (node.source) {
                checkImport(node.source);
              }
            },

            ExportAllDeclaration(node) {
              checkImport(node.source);
            },

            ImportExpression(node) {
              checkImport(node.source);
            },

            TSImportEqualsDeclaration(node) {
              if (node.moduleReference.type === 'TSExternalModuleReference') {
                checkImport(node.moduleReference.expression);
              }
            },

            TSImportType(node) {
              const argument = node.argument ?? node.source;

              checkImport(argument?.type === 'TSLiteralType' ? argument.literal : argument);
            },

            CallExpression(node) {
              if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
                checkImport(node.arguments[0]);
              }
            },
          };
        },
      },
    },
  };
}

export function createBoundaryConfig({ repositoryRoot, workspaceRoot, browser = false } = {}) {
  if (!repositoryRoot || !workspaceRoot) {
    throw new Error('repositoryRoot and workspaceRoot are required.');
  }

  const plugin = createBoundaryPlugin({
    repositoryRoot,
    workspaceRoot,
    browser,
  });

  return defineConfig([
    {
      name: 'stagegate/workspace-boundaries',

      files: sourceFiles,

      plugins: {
        stagegate: plugin,
      },

      rules: {
        'stagegate/enforce-imports': 'error',
      },
    },
  ]);
}
