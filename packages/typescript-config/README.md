# @stagegate/typescript-config

Shared TypeScript compiler configurations for StageGate.

## Configurations

| Configuration      | Purpose                            |
| ------------------ | ---------------------------------- |
| base.json          | Common strict compiler options     |
| react.json         | React applications using a bundler |
| node.json          | Node.js applications               |
| nest.json          | NestJS applications                |
| library.json       | Runtime-neutral compiled libraries |
| react-library.json | React component libraries          |
| node-library.json  | Server-side libraries              |

## Usage

Declare the package as a development dependency:

```json
{
  "devDependencies": {
    "@stagegate/typescript-config": "*",
    "typescript": "5.9.3"
  }
}
```

Extend the appropriate configuration:

```json
{
  "extends": "@stagegate/typescript-config/library.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Rules

- Strict TypeScript checking is mandatory.
- Shared configurations must not contain workspace-specific paths.
- Each workspace owns its include and exclude patterns.
- Each compiled workspace owns its output directory.
- Browser packages must not depend on server-only libraries.
- TypeScript exceptions must be narrowly scoped and documented.
- Public library APIs must expose explicit package entry points.
