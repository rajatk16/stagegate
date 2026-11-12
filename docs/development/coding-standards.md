# StageGate Coding Standards

## TypeScript

All application and shared library code must use
strict TypeScript configurations.

Avoid:

- Explicit any
- Unsafe type assertions
- Non-null assertions
- Unhandled promises
- Unchecked indexed access
- Unnecessary compiler suppressions

Use unknown for untrusted external data.

Validate external data before converting it into
domain types.

## Naming conventions

### Files

Use kebab-case for ordinary TypeScript files.

Examples:

- organization.service.ts
- proposal.repository.ts
- review-assignment.ts
- use-organization.ts

React components may use PascalCase filenames
when appropriate.

### Types and classes

Use PascalCase.

Examples:

- Organization
- ProposalStatus
- ReviewService

### Variables and functions

Use camelCase.

Examples:

- organizationId
- createProposal
- calculateReviewScore

### Constants

Use UPPER_SNAKE_CASE for module-level constants
representing fixed values.

## Imports

Use package entry points for shared packages.

Do not import internal source files from another
workspace.

Import groups are:

1. Node.js built-in modules
2. External dependencies
3. StageGate packages
4. Relative imports
5. Type-only imports

Declare all direct dependencies in package.json.

## Error handling

Throw Error instances or domain-specific errors.

Do not throw strings or arbitrary objects.

Catch variables must be narrowed before accessing
their properties.

## Asynchronous code

Promises must be awaited or explicitly handled.

Do not use void as a substitute for error handling.

## React

Follow the Rules of Hooks.

Do not suppress exhaustive dependency checks
without a documented reason.

Use semantic HTML.

Provide accessible labels and keyboard interactions.

Avoid unsafe HTML injection.

## NestJS

Preserve runtime imports required for decorator
metadata and dependency injection.

Do not globally disable strict property initialization.

## Formatting

Use Prettier.

Run:

```bash
npm run format
npm run format:check
```

## Verification

Before opening a pull request:

```bash
npm run check
```

All lint warnings are treated as verification failures.

## Exceptions

Engineering rules may be overridden only when:

- The exception is necessary.
- Its scope is minimal.
- Its reason is documented.
- The exception does not weaken security or
  tenant isolation.
