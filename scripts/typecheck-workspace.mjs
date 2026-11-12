import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const workspaceRoot = process.cwd();

const manifestPath = join(workspaceRoot, 'package.json');

const configPath = join(workspaceRoot, 'tsconfig.json');

if (!existsSync(manifestPath)) {
  console.error(`Missing workspace manifest: ${manifestPath}`);

  process.exit(1);
}

if (!existsSync(configPath)) {
  console.error(`Missing TypeScript configuration: ${configPath}`);

  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const require = createRequire(manifestPath);

const ts = require('typescript');

const diagnosticHost = {
  getCanonicalFileName(fileName) {
    return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
  },

  getCurrentDirectory() {
    return workspaceRoot;
  },

  getNewLine() {
    return ts.sys.newLine;
  },
};

function reportDiagnostics(diagnostics) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticHost));
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

if (configFile.error) {
  reportDiagnostics([configFile.error]);

  process.exit(1);
}

const parsed = ts.parseJsonConfigFileContent(
  configFile.config,

  ts.sys,

  dirname(configPath),

  {
    noEmit: true,
  },

  configPath,
);

const hasNoSourceFiles = parsed.fileNames.length === 0;

const configurationErrors = parsed.errors.filter(
  (diagnostic) => !(diagnostic.code === 18003 && hasNoSourceFiles),
);

if (configurationErrors.length > 0) {
  reportDiagnostics(configurationErrors);

  process.exit(1);
}

if (hasNoSourceFiles) {
  console.log(
    `[${manifest.name}] No TypeScript source files yet. Configuration parsed successfully.`,
  );

  process.exit(0);
}

const program = ts.createProgram({
  rootNames: parsed.fileNames,

  options: parsed.options,

  projectReferences: parsed.projectReferences,
});

const diagnostics = ts.getPreEmitDiagnostics(program);

const errors = diagnostics.filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);

if (diagnostics.length > 0) {
  reportDiagnostics(diagnostics);
}

if (errors.length > 0) {
  console.error(`[${manifest.name}] Type checking failed.`);

  process.exit(1);
}

console.log(`[${manifest.name}] Type checking passed.`);
