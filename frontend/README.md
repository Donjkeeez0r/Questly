**Project: Quiz Platform — Frontend**

This directory contains the React + Vite frontend for the Quiz Platform. It provides the public quiz player, creator tools, profile screens, and result views.

**Docker**
- This folder now contains its own `Dockerfile` for building the frontend image independently.
- From the repository root, `docker compose up -d --build` uses `frontend/Dockerfile` automatically.
- Frontend is served on `http://localhost/` in Docker Compose.

**Local Development**
1. Install dependencies:
```bash
pnpm install
```
2. Start the dev server:
```bash
pnpm --dir frontend dev
```
3. Build and preview a production build:
```bash
pnpm --dir frontend build
pnpm --dir frontend preview
```

**Configuration**
- API base URL and other runtime values are configured in `src/lib/api.ts` and the Vite setup.
- Frontend types live in `src/types/api.ts`.

**Notes**
- Build output is created in `dist/`.
- If the app cannot reach the backend in Docker, verify `docker compose ps` and backend logs.
