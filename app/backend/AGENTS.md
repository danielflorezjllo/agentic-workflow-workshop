# AGENTS.md

## Purpose

This package provides the product catalog backend API.
Stack: Python 3.12, FastAPI, Pydantic, Ruff, Pytest, and `uv`.

## Quick Commands

Run all commands from `app/backend/`.

```bash
uv venv --python 3.12 && uv sync
uv run python run_api.py
uv run pytest
uv run ruff check .
uv run ruff format .
```

## Architecture

Use the existing layered design:

- API layer for HTTP handlers and routing
- Service layer for business logic
- Models for request/response and domain validation
- Seed data for the in-memory catalog
- Core settings and structured logging

## Package Conventions

- Product fields use the `product_` prefix.
- Monetary values use backend `Decimal` and are serialized as strings in JSON.
- Categories are constrained to: `electronics`, `clothing`, `home`, `sports`, `books`.
- Error responses use the shared `ErrorResponse` shape.
- Keep structured log events in snake_case.

## Validation

- Run targeted tests for changed behavior first.
- Run `uv run pytest` before finalizing backend changes.
