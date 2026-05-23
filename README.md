# Quiz Platform — Monorepo

This repository contains a full-featured Quiz Platform with a backend service and a frontend client. The project supports quiz creation, editing, playing, achievements, leaderboards, and AI-generated feedback.

Folders
- `backend/` — NestJS + Prisma backend service (APIs, business logic, database migrations).
- `frontend/` — React + Vite frontend client (UI for creators and players).

Overview
- Creators can create and manage quizzes and add achievements.
- Users can play quizzes, get scores, earn achievements, and view leaderboards.
- AI feedback for answers is available via configurable generative model (Gemini) when API key is provided.

Quick Start (Docker)
1. From repository root:
```bash
docker compose up -d --build
```
2. Docker Compose uses the service-specific Dockerfiles in `backend/Dockerfile` and `frontend/Dockerfile`.
3. Services started:
- Backend container: `http://localhost:3000`
- Frontend: `http://localhost/`
- Postgres and Redis run as containers for persistence and caching.

Local Development (recommended)
- Install dependencies (at repo root):
```bash
pnpm install
```
- Backend dev:
```bash
pnpm --dir backend install
pnpm --dir backend prisma generate
pnpm --dir backend prisma migrate dev
pnpm --dir backend start:dev
```
- Local backend dev still listens on `http://localhost:3001`.
- Frontend dev:
```bash
pnpm --dir frontend install
pnpm --dir frontend dev
```

Environment variables (high level)
- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string (optional)
- `JWT_SECRET` — authentication secret
- `GEMINI_API_KEY` — optional, for AI feedback
- See `backend/README.md` and `frontend/README.md` for service-specific notes.

Database & Migrations
- Prisma schema is in `backend/prisma/schema.prisma` and migrations are in `backend/prisma/migrations/`.
- Run `pnpm --dir backend prisma migrate deploy` in CI or production to apply migrations.

Building & Production
- Build backend and frontend locally, or use the Dockerfiles in each service directory to build container images.
```bash
pnpm --dir backend build
pnpm --dir frontend build
```
- For containerized runs, use `docker compose up -d --build` from the repository root.

Testing & CI recommendations
- Add unit tests (Jest/Vitest) for frontend and backend services.
- CI pipeline should run lint, type checks, tests, `prisma generate`, and build steps for both services.
- Publish Docker images from CI and deploy using your orchestration platform.

Troubleshooting
- If `prisma migrate deploy` fails with missing `DATABASE_URL`, ensure env vars are set before running migrations.
- If `start:prod` complains about missing `dist/main`, run the build step and verify `package.json` start scripts point to the correct output (Nest typically outputs `dist/src/main.js`).

Next steps & Improvements
- Generate OpenAPI/Swagger and share types between backend and frontend.
- Add E2E tests (Playwright/Cypress) and integration tests for Prisma flows.
- Harden security (rate limiting, input validation) and add observability (Sentry, Prometheus).

Useful files
- Backend README: [backend/README.md](backend/README.md)
- Frontend README: [frontend/README.md](frontend/README.md)

---
Update this file with any organisation-specific deployment notes or credentials handling workflow.
