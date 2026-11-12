import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs';

import {
  join,
  relative,
} from 'node:path';

const WORKSPACE_GROUPS = [
  'apps',
  'packages',
];

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const FORBIDDEN_LOCKFILES = [
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lock',
  'bun.lockb',
];

const PACKAGE_NAMESPACE = '@stagegate/';

const EXPECTED_WORKSPACES = [
  'apps/*',
  'packages/*',
];

/**
 * Read and parse a package manifest.
 *
 * @param {string} filePath
 * @returns {Record<string, unknown>}
 */
export function readManifest(filePath) {
  try {
    const manifest = JSON.parse(
      readFileSync(filePath, 'utf8'),
    );

    if (
      manifest === null ||
      typeof manifest !== 'object' ||
      Array.isArray(manifest)
    ) {
      throw new Error(
        'Package manifest must be a JSON object.',
      );
    }

    return manifest;
  } catch (error) {
    throw new Error(
      `Unable to read manifest ${filePath}: ${error.message}`,
      { cause: error },
    );
  }
}

/**
 * Discover application and package workspaces.
 *
 * @param {string} rootDirectory
 * @returns {{
 *   workspaces: Array<{
 *     group: string,
 *     directory: string,
 *     manifest: Record<string, unknown>
 *   }>,
 *   errors: string[]
 * }}
 */
export function discoverWorkspaces(rootDirectory) {
  const workspaces = [];
  const errors = [];

  for (const group of WORKSPACE_GROUPS) {
    const groupDirectory = join(
      rootDirectory,
      group,
    );

    if (!existsSync(groupDirectory)) {
      errors.push(
        `Missing workspace directory: ${group}`,
      );

      continue;
    }

    let entries;

    try {
      entries = readdirSync(groupDirectory, {
        withFileTypes: true,
      });
    } catch (error) {
      errors.push(
        `Unable to read ${group}: ${error.message}`,
      );

      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isSymbolicLink()) {
        errors.push(
          `Symbolic-link workspaces are not allowed: ${group}/${entry.name}`,
        );

        continue;
      }

      if (!entry.isDirectory()) {
        continue;
      }

      const directory = join(
        groupDirectory,
        entry.name,
      );

      const manifestPath = join(
        directory,
        'package.json',
      );

      if (!existsSync(manifestPath)) {
        errors.push(
          `Missing package.json: ${group}/${entry.name}`,
        );

        continue;
      }

      try {
        workspaces.push({
          group,
          directory,
          manifest: readManifest(manifestPath),
        });
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  return {
    workspaces,
    errors,
  };
}

/**
 * Collect declared internal dependencies.
 *
 * @param {Record<string, unknown>} manifest
 * @returns {Array<{
 *   name: string,
 *   version: string,
 *   field: string
 * }>}
 */
export function getInternalDependencies(manifest) {
  const dependencies = [];

  for (const field of DEPENDENCY_FIELDS) {
    const entries = manifest[field];

    if (
      entries === null ||
      typeof entries !== 'object' ||
      Array.isArray(entries)
    ) {
      continue;
    }

    for (const [name, version] of Object.entries(entries)) {
      if (name.startsWith(PACKAGE_NAMESPACE)) {
        dependencies.push({
          name,
          version,
          field,
        });
      }
    }
  }

  return dependencies;
}

/**
 * Detect circular dependencies in a directed graph.
 *
 * @param {Map<string, Set<string>>} graph
 * @returns {string[]}
 */
export function findDependencyCycles(graph) {
  const errors = [];
  const visited = new Set();
  const visiting = new Set();
  const path = [];

  function visit(name) {
    if (visiting.has(name)) {
      const cycleStart = path.indexOf(name);

      const cycle = [
        ...path.slice(cycleStart),
        name,
      ];

      errors.push(
        `Circular workspace dependency: ${cycle.join(' -> ')}`,
      );

      return;
    }

    if (visited.has(name)) {
      return;
    }

    visiting.add(name);
    path.push(name);

    for (const dependency of graph.get(name) ?? []) {
      visit(dependency);
    }

    path.pop();
    visiting.delete(name);
    visited.add(name);
  }

  for (const name of graph.keys()) {
    visit(name);
  }

  return errors;
}

/**
 * Validate StageGate workspace conventions.
 *
 * @param {string} rootDirectory
 * @returns {{
 *   valid: boolean,
 *   errors: string[],
 *   workspaces: string[]
 * }}
 */
export function validateWorkspaces(rootDirectory) {
  const errors = [];

  let rootManifest;

  try {
    rootManifest = readManifest(
      join(rootDirectory, 'package.json'),
    );
  } catch (error) {
    return {
      valid: false,
      errors: [error.message],
      workspaces: [],
    };
  }

  if (rootManifest.name !== 'stagegate') {
    errors.push(
      'Root package name must be "stagegate".',
    );
  }

  if (rootManifest.private !== true) {
    errors.push(
      'Root package must be private.',
    );
  }

  if (
    !Array.isArray(rootManifest.workspaces) ||
    rootManifest.workspaces.length !==
      EXPECTED_WORKSPACES.length ||
    !EXPECTED_WORKSPACES.every((workspace) =>
      rootManifest.workspaces.includes(workspace),
    )
  ) {
    errors.push(
      'Root workspaces must contain exactly "apps/*" and "packages/*".',
    );
  }

  for (const lockfile of FORBIDDEN_LOCKFILES) {
    if (lockfile === 'package-lock.json') {
      continue;
    }

    if (existsSync(join(rootDirectory, lockfile))) {
      errors.push(
        `Unexpected root lockfile: ${lockfile}`,
      );
    }
  }

  const discovered = discoverWorkspaces(
    rootDirectory,
  );

  errors.push(...discovered.errors);

  const workspaceMap = new Map();

  for (const workspace of discovered.workspaces) {
    const { manifest, directory, group } = workspace;

    const workspacePath = relative(
      rootDirectory,
      directory,
    );

    const directoryName = workspacePath
      .split(/[\\/]/)
      .at(-1);

    const expectedName =
      `${PACKAGE_NAMESPACE}${directoryName}`;

    if (manifest.name !== expectedName) {
      errors.push(
        `${workspacePath}: expected package name "${expectedName}".`,
      );
    }

    if (manifest.private !== true) {
      errors.push(
        `${workspacePath}: workspace must be private.`,
      );
    }

    if (
      typeof manifest.version !== 'string' ||
      !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
        manifest.version,
      )
    ) {
      errors.push(
        `${workspacePath}: workspace must declare a version.`,
      );
    }

    for (const field of DEPENDENCY_FIELDS) {
      if (!(field in manifest)) {
        continue;
      }

      const dependencies = manifest[field];

      if (
        dependencies === null ||
        typeof dependencies !== 'object' ||
        Array.isArray(dependencies)
      ) {
        errors.push(
          `${workspacePath}: ${field} must be an object.`,
        );

        continue;
      }

      for (const [name, version] of Object.entries(
        dependencies,
      )) {
        if (typeof version !== 'string') {
          errors.push(
            `${workspacePath}: ${field}.${name} must be a string.`,
          );
        }
      }
    }

    for (const lockfile of FORBIDDEN_LOCKFILES) {
      if (existsSync(join(directory, lockfile))) {
        errors.push(
          `${workspacePath}: unexpected workspace lockfile "${lockfile}".`,
        );
      }
    }

    if (
      typeof manifest.name !== 'string' ||
      manifest.name.length === 0
    ) {
      continue;
    }

    if (workspaceMap.has(manifest.name)) {
      errors.push(
        `Duplicate workspace name: ${manifest.name}`,
      );

      continue;
    }

    workspaceMap.set(manifest.name, {
      group,
      directory,
      manifest,
    });
  }

  const graph = new Map();

  for (const name of workspaceMap.keys()) {
    graph.set(name, new Set());
  }

  for (const [name, workspace] of workspaceMap) {
    const dependencies = getInternalDependencies(
      workspace.manifest,
    );

    for (const dependency of dependencies) {
      const target = workspaceMap.get(
        dependency.name,
      );

      if (!target) {
        errors.push(
          `${name}: unknown internal dependency "${dependency.name}".`,
        );

        continue;
      }

      if (dependency.version !== '*') {
        errors.push(
          `${name}: internal dependency "${dependency.name}" must use "*".`,
        );
      }

      if (target.group === 'apps') {
        errors.push(
          `${name}: dependencies on application "${dependency.name}" are prohibited.`,
        );
      }

      graph.get(name).add(dependency.name);
    }
  }

  errors.push(
    ...findDependencyCycles(graph),
  );

  return {
    valid: errors.length === 0,
    errors,
    workspaces: [...workspaceMap.keys()].sort(),
  };
}
