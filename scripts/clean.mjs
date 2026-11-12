import { existsSync, lstatSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

const rootDirectory = resolve(scriptDirectory, '..');

const argumentsList = process.argv.slice(2);

const allowedArguments = new Set(['--all', '--dry-run']);

for (const argument of argumentsList) {
  if (!allowedArguments.has(argument)) {
    console.error(`Unknown cleanup argument: ${argument}`);

    process.exit(1);
  }
}

const cleanDependencies = argumentsList.includes('--all');

const dryRun = argumentsList.includes('--dry-run');

const generatedDirectories = [
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.next',
  '.vite',
  '.cache',
  '.nyc_output',
  'playwright-report',
  'test-results',
];

if (cleanDependencies) {
  generatedDirectories.push('node_modules');
}

const directoriesToClean = [rootDirectory];

for (const group of ['apps', 'packages']) {
  const groupDirectory = join(rootDirectory, group);

  if (!existsSync(groupDirectory)) {
    continue;
  }

  if (lstatSync(groupDirectory).isSymbolicLink()) {
    console.error(`Refusing to traverse symbolic link: ${group}`);

    process.exit(1);
  }

  const entries = readdirSync(groupDirectory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    directoriesToClean.push(join(groupDirectory, entry.name));
  }
}

let removedCount = 0;

function removeGeneratedPath(target) {
  if (!existsSync(target)) {
    return;
  }

  const displayPath = relative(rootDirectory, target);

  if (dryRun) {
    console.log(`Would remove: ${displayPath}`);
  } else {
    rmSync(target, {
      recursive: true,
      force: true,
    });

    console.log(`Removed: ${displayPath}`);
  }

  removedCount += 1;
}

for (const directory of directoriesToClean) {
  for (const generated of generatedDirectories) {
    removeGeneratedPath(join(directory, generated));
  }

  const entries = readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.tsbuildinfo')) {
      removeGeneratedPath(join(directory, entry.name));
    }
  }
}

console.log(
  `\nCleanup ${dryRun ? 'preview' : 'complete'}: ` + `${removedCount} generated path(s).\n`,
);

if (cleanDependencies && !dryRun) {
  console.log('Run npm ci to reinstall dependencies.');
}
