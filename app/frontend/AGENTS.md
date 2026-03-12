# AGENTS.md

## Purpose

This package provides the product catalog frontend UI.
Stack: React, TypeScript, Bun, Tailwind CSS, shadcn/ui, and Biome.

## Quick Commands

Run all commands from `app/frontend/`.

```bash
bun install
bun dev
bun run build
bun run check
bun run check:fix
```

## Architecture

- App-level state and data loading live in `App.tsx`.
- Product list UI flows through `ProductGrid` and `ProductCard`.
- API calls are centralized in `src/lib/api-client.ts`.
- Frontend types mirror backend response contracts.

## Package Conventions

- Preserve the existing component and type organization.
- Keep API contracts aligned with backend models.
- Keep the frontend API base URL aligned with local backend development.
- Prefer shared UI primitives before creating new component patterns.

## Validation

- Run `bun run check` for lint/format validation.
- Run `bun run build` before finalizing frontend changes.
