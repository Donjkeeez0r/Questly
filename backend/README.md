**Project: Quiz Platform — Backend**

This directory contains the NestJS + Prisma backend for the Quiz Platform. It exposes HTTP APIs for quiz creation, quiz play, achievements, authentication, and scoring.

**Docker**
- This folder now contains its own `Dockerfile` for building the backend image independently.
- From the repository root, `docker compose up -d --build` uses `backend/Dockerfile` automatically.
- Backend is exposed on `http://localhost:3000` in Docker Compose.

**Local Development**
1. Install dependencies:
```bash
pnpm install
```
2. Configure environment variables in `backend/.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string, optional
- `JWT_SECRET` — authentication secret
- `GEMINI_API_KEY` — optional, for AI features
3. Generate Prisma artifacts and apply migrations:
```bash
pnpm --dir backend prisma generate
pnpm --dir backend prisma migrate deploy
```
4. Start the dev server:
```bash
pnpm --dir backend start:dev
```

**Production**
- Build locally with `pnpm --dir backend build`.
- Build the container image from this directory with `docker build -t questly-backend .`.

**Notes**
- Prisma schema: `prisma/schema.prisma`.
- Migrations: `prisma/migrations/`.
- If Docker startup fails, check `docker compose logs backend` and confirm the database is reachable.
