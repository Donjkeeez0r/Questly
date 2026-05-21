**Project: Quiz Platform — Frontend**

This directory contains the frontend client for the Quiz Platform built with React + Vite and TypeScript. It provides UI for browsing quizzes, playing them, viewing results and achievements, and managing quizzes for creators.

**Tech Stack**
- React (TypeScript)
- Vite
- Tailwind CSS
- pnpm

**Quick Start (Docker)**
1. From repository root:
```bash
cd main
docker compose up -d --build
```
2. Frontend will be served by the `frontend` service (port defined in `docker-compose.yml`, commonly 8080).

**Local Development (without Docker)**
1. Install dependencies:
```bash
pnpm install
```
2. Start dev server:
```bash
pnpm --dir frontend dev
```
3. Build for production:
```bash
pnpm --dir frontend build
pnpm --dir frontend preview
```

**Configuration**
- API base URL and other runtime values are typically set via environment variables or the proxy in Vite config. Check `src/lib/api.ts` for the HTTP client configuration.

**Type Safety & API**
- Frontend types live in `src/types/api.ts`. Keep these types in sync with backend DTOs — consider generating types from OpenAPI or sharing a type package in monorepos.

**Testing**
- Add unit tests with Jest or Vitest and e2e tests with Playwright or Cypress.

**Performance**
- Bundle sizes are reported by Vite during build. Consider code-splitting and lazy-loading heavy components if chunk sizes exceed desired limits.

**Troubleshooting**
- If preview/build fails, run `pnpm --dir frontend build` and inspect Vite output.
- If API calls fail due to CORS or auth, check backend `JWT_SECRET` and frontend `api` base URL.

**Contributing**
- Run linters and formatters before PR.
- Keep components small and add unit tests for business logic.

---
Generated README for frontend. Update host/port and environment instructions to match your deployment.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
