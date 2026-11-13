# @stagegate/web

StageGate's organization, reviewer and speaker web application.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Zustand
- Zod
- Vitest

## Development

From the repository root:

```bash
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev:web
```

## Routes

| Route              | Purpose             |
| ------------------ | ------------------- |
| /                  | Public landing page |
| /app               | Organizer workspace |
| /speaker           | Speaker dashboard   |
| /speaker/proposals | Speaker proposals   |
| /unauthorized      | Unauthorized page   |

## Verification

```bash
npm run test:web
npm run build:web
npm run check
```

See [Frontend Development](../../docs/development/frontend.md) for architecture and development conventions.
