# @stagegate/contracts

Shared StageGate API wire contracts.

## Responsibilities

- Runtime validation schemas
- API response types
- Error codes
- Pagination contracts
- Shared identifiers

## Build

```bash
npm run build --workspace=@stagegate/contracts
```

## Test

```bash
npm run test --workspace=@stagegate/contracts
```

## Rules

- No framework dependencies
- No Firebase SDK dependencies
- No persistence entities
- No application-specific state
- Import through the public package entry point

Both ESM and CommonJS consumers are supported.
