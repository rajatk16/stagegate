# StageGate Docker Infrastructure

## Images

- stagegate-development
- stagegate-firebase
- stagegate-api
- stagegate-web

## Development

```bash
docker compose up --build --watch
```

## Production reference configuration

```bash
docker compose \
  -f compose.production.yaml \
  build
```

## Architecture

Development uses a shared Node.js image and Firebase Emulator Suite.

Production uses pruned multi-stage builds for NestJS and React.

Nginx serves frontend assets and proxies API requests.

## Security

- Non-root application processes
- Read-only production containers
- Restricted Linux capabilities
- No embedded credentials
- Private API networking
- Localhost-only development ports

## Persistence

Firebase emulator exports are stored in named Docker volumes.

## Documentation

See docs/development/docker.md and docs/adr/0007-docker-infrastructure.md.
