import {
  dirname,
  resolve,
} from 'node:path';

import {
  fileURLToPath,
} from 'node:url';

import {
  validateWorkspaces,
} from './lib/workspace-validation.mjs';

const scriptDirectory = dirname(
  fileURLToPath(import.meta.url),
);

const rootDirectory = resolve(
  scriptDirectory,
  '..',
);

const result = validateWorkspaces(
  rootDirectory,
);

if (!result.valid) {
  console.error(
    '\nStageGate workspace validation failed.\n',
  );

  for (const error of result.errors) {
    console.error(`  - ${error}`);
  }

  console.error(
    `\nFound ${result.errors.length} error(s).\n`,
  );

  process.exitCode = 1;
} else {
  console.log(
    '\nStageGate workspace validation passed.\n',
  );

  for (const workspace of result.workspaces) {
    console.log(`  ✓ ${workspace}`);
  }

  console.log(
    `\nValidated ${result.workspaces.length} workspace(s).\n`,
  );
}
