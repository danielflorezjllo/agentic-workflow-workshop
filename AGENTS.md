# AGENTS.md

## Purpose

This repository is an e-commerce product catalog workshop for agentic development workflows.
It is a monorepo with a Python/FastAPI backend and a React/Bun frontend.

## Monorepo Map

- `app/backend/`: API and business logic
- `app/frontend/`: UI and frontend API client
- `tasks/`: workshop stories and implementation prompts

## Instruction Scope

- This root file contains only repo-wide guidance.
- Use descendant files for implementation details:
	- `app/backend/AGENTS.md`
	- `app/frontend/AGENTS.md`
- When editing files in a subproject, follow the nearest local `AGENTS.md` in addition to this root file.

## Shared Workflow

- Make focused changes in the smallest relevant scope.
- Preserve existing architecture and naming conventions unless the task requires a change.
- Prefer deterministic checks (tests, linters, build) over manual style enforcement.
- Validate the area you changed before finishing.

## Where To Look Next

- Backend-specific commands and conventions: `app/backend/AGENTS.md`
- Frontend-specific commands and conventions: `app/frontend/AGENTS.md`
- Story requirements: `tasks/Story-1.md`, `tasks/Story-2.md`

## Agent Skills

This repo includes reusable workflow skills under `.agents/skills/` (for priming, planning, execution, and browser automation).
