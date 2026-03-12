# Agentic Workflow Workshop

Monorepo workshop for building an e-commerce product catalog with a Python/FastAPI backend and a React/Bun frontend.

## What You Will Build

- A product catalog API (`/api/products`) with structured logging.
- A frontend UI that consumes the backend API.
- Product filtering features as part of workshop stories in `tasks/`.

## Prerequisites

- Python 3.12
- `uv` package manager
- Bun runtime (`bun`)

## Quick Start

Run backend and frontend in separate terminals.

1. Backend

```bash
cd app/backend
uv venv --python 3.12
uv sync
uv run python run_api.py
# API: http://localhost:8000
```

2. Frontend

```bash
cd app/frontend
bun install
bun dev
# App: http://localhost:3000
```

## Useful Commands

### Backend (`app/backend`)

```bash
uv run python run_api.py
uv run pytest
uv run pytest tests/test_products_basic.py::test_name
uv run ruff check .
uv run ruff format .
```

### Frontend (`app/frontend`)

```bash
bun dev
bun run build
bun run check
bun run check:fix
```

## API Overview

- `GET /health`: health endpoint, returns `{"status": "healthy"}`.
- `GET /api/products`: returns catalog products.

Current data source is in-memory seed data from `app/backend/app/data/seed_products.py`.
There is no persistent database configured in this workshop baseline.

## Project Structure

```text
app/
   backend/
      app/
         api/          # FastAPI routes
         services/     # Business logic
         models/       # Pydantic models
         data/         # In-memory seed data
         core/         # Config + logging
      tests/          # Backend tests
   frontend/
      src/
         components/   # UI components
         lib/          # API client + utilities
         types/        # Shared frontend types
tasks/
   Story-1.md        # Backend filtering story
   Story-2.md        # Frontend filtering story
```

## Workshop Flow

1. Review the stories in `tasks/Story-1.md` and `tasks/Story-2.md`.
2. Implement backend behavior and make backend tests pass.
3. Implement frontend filtering UI and validate behavior in the browser.

## Notes

- Backend CORS is enabled for local development.
- Product prices are represented as `Decimal` in backend models and serialized as strings in API responses.
