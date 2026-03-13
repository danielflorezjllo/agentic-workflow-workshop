---
name: switch-ports
description: >
  Switch backend and frontend ports for this repo so multiple local copies can run in parallel without
  port conflicts. Use this skill whenever the user wants to run two instances of this project side by
  side, change development ports, avoid port conflicts, or start the app on a different port. Triggers
  include: "run on another port", "parallel instances", "port conflict", "change port", "second copy",
  "run alongside another repo".
---

# Switch Ports

Use environment variables to override the default ports at start-up.
No code changes are needed — just prefix the start command with the relevant vars.

## Default Ports

| Service           | Default | Env var(s)                        |
| ----------------- | ------- | --------------------------------- |
| Backend (FastAPI) | `8000`  | `API_PORT`                        |
| Frontend (Bun)    | `3000`  | `PORT`, `BUN_PUBLIC_API_BASE_URL` |

## How to Start a Second Instance

Pick a free port pair (e.g. `8001` / `3001`) and start each service:

```bash
# Terminal 1 — backend on port 8001
cd app/backend
API_PORT=8001 uv run python run_api.py

# Terminal 2 — frontend on port 3001, pointing to the backend above
cd app/frontend
PORT=3001 BUN_PUBLIC_API_BASE_URL=http://localhost:8001 bun --hot src/index.tsx
```

Open the second frontend at **http://localhost:3001**.

## How It Works

### Backend

`app/core/config.py` exposes `api_port` via `pydantic-settings`:

```python
api_port: int = 8000   # overridden by API_PORT env var
```

`run_api.py` passes `settings.api_port` to uvicorn, so any value set through `API_PORT` is used automatically.

### Frontend server

`src/index.tsx` reads:

```ts
port: parseInt(process.env.PORT ?? "3000", 10),
```

### Frontend API client

`src/lib/api-client.ts` reads:

```ts
const API_BASE_URL =
  process.env.BUN_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
```

`BUN_PUBLIC_*` variables are inlined by Bun at build / dev time (configured in `bunfig.toml`).

## Quick Reference

| Scenario                 | Command prefix                                                              |
| ------------------------ | --------------------------------------------------------------------------- |
| Default (first instance) | _(no prefix needed)_                                                        |
| Second instance          | `API_PORT=8001` / `PORT=3001 BUN_PUBLIC_API_BASE_URL=http://localhost:8001` |
| Third instance           | `API_PORT=8002` / `PORT=3002 BUN_PUBLIC_API_BASE_URL=http://localhost:8002` |

## Agent Steps

When the user asks to start a parallel instance or switch ports:

1. Ask (or infer) which port pair to use.
2. Show the two start commands with the correct env var prefixes.
3. Remind the user that `BUN_PUBLIC_API_BASE_URL` must point to the **same instance's** backend port.
4. No file edits are required.
