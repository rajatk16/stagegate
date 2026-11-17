# StageGate Docker Development

## Requirements

- Docker Engine or Docker Desktop
- Docker Compose 2.32 or newer
- Git

Node.js, npm and Java are not required on the host when using the containerized workflow.

## Start development

```bash
docker compose up --build --watch
```

## Available services

- Web: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/docs
- Firebase UI: http://localhost:4001

## Source changes

Frontend and backend source changes are synchronized into running containers.

Shared package changes trigger container restarts and shared package compilation.

Dependency manifest changes trigger image rebuilds.

## Logs

```bash
docker compose logs -f
```

## Status

```bash
docker compose ps
```

## Execute tests

```bash
docker compose exec api \
  npm run test --workspace=@stagegate/api
```

```bash
docker compose exec web \
  npm run test --workspace=@stagegate/web
```

## Stop

```bash
docker compose down
```

Named emulator volumes are retained.

## Reset emulator data

```bash
docker compose down --volumes
```

This permanently removes local emulator data.

## Production images

```bash
docker compose \
  -f compose.production.yaml \
  build
```

Production containers require valid cloud configuration and Application Default Credentials.

Never commit credential files.

## Networking

Browser requests use localhost during development.

Containers communicate through Compose service names.

Production browser requests use same-origin API routing through Nginx.

## Troubleshooting

Inspect service status and logs before rebuilding or removing containers.

Do not remove volumes unless a data reset is intended.
