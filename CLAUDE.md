# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Linux command-line learning platform (Chinese UI). Users progress through 60+ levels across 7 chapters, each providing an isolated Docker container to practice Linux commands. Real-time terminal via xterm.js + Socket.IO.

## Commands

```bash
# Development (from root)
npm run dev                  # Start frontend + backend concurrently
npm run dev:frontend         # Frontend only (Vite, port 5173)
npm run dev:backend          # Backend only (Express, port 3001)
npm run install:all          # Install deps for both frontend and backend

# Docker (required before first run)
npm run build:docker         # Build level container image

# Backend tests
cd backend && npm test       # Run all tests (vitest)
cd backend && npm run test:watch    # Watch mode
cd backend && npm run test:e2e      # E2E tests

# Frontend
cd frontend && npm run build   # TypeScript check + Vite build
cd frontend && npm run lint    # ESLint
```

## Architecture

**Monorepo with two packages:** `frontend/` (React + Vite) and `backend/` (Express + Socket.IO). Root `package.json` uses `concurrently` to run both.

### Frontend (`frontend/src/`)
- **React 18 + TypeScript + Tailwind CSS + Vite**
- State via React Context (`AuthContext`, `ThemeContext`) — no external state library
- `data/levels/` — Level definitions organized by chapter (`chapter1.ts` through `chapter7.ts`), exported as flat `LEVELS` array from `index.ts`. Each level has: id, chapter, title, description, hint, command, validation rules, knowledge cards
- `components/Terminal/` — xterm.js wrapper, communicates with backend via Socket.IO
- `services/api.ts` — Axios client with JWT interceptor; `services/socket.ts` — Socket.IO connection
- Vite dev server proxies `/api` and `/socket.io` to backend at port 3001

### Backend (`backend/src/`)
- **Express + Socket.IO + TypeScript (ESM)**
- `docker/containerManager.ts` — Creates/destroys Docker containers per session, executes commands as `player` user, tracks command history per session. Each level has optional setup commands (create users, start services, place files)
- `levels/validator.ts` — Level completion validation. Maps level ID to a `ValidationRule` (type + expected). Some levels (6-8, 10) require multi-step validation checking command history
- `socket/handlers.ts` — Socket.IO event handlers for session lifecycle and command execution
- `routes/` — REST endpoints: `auth.ts` (login/register with captcha), `user.ts` (progress), `wrongRecords.ts` (mistake notebook)
- `db/` — SQLite via better-sqlite3 (WAL mode, foreign keys). Tables: `users`, `user_progress`, `wrong_records`
- Auth: JWT (3-day expiry), bcryptjs hashing, account lockout after 5 failed attempts

### Real-time Flow
1. Frontend emits `session:create` with level ID → backend creates Docker container with level setup
2. User types command → `terminal:input` → backend exec in container → `terminal:output` back to frontend
3. Each command also runs through `validateLevel()` → if passed, emits `level:completed`
4. On disconnect, container is destroyed

### Level Validation Types
`command`, `output_contains`, `output_number`, `output_lines_gte`, `file_exists`, `directory_exists`, `file_content`, `file_content_contains`, `file_permission`, `directory_permission`, `permission_exists`, `user_exists`, `user_in_group`, `nginx_running`, `env_var_set`

### Adding a New Level
1. Add level definition in `frontend/src/data/levels/chapter*.ts` (follows `Level` interface from `types.ts`)
2. Add validation rule in `backend/src/levels/validator.ts` (`LEVEL_VALIDATIONS` map)
3. If the level needs pre-setup (files, users, services), add setup commands in `backend/src/docker/containerManager.ts`

## Key Conventions

- All UI text is in Chinese
- Backend uses ESM (`"type": "module"`) — imports require `.js` extensions
- Docker container image: `linux-learning-level:latest` (built from `docker/Dockerfile.level`)
- Guest users store progress in localStorage; logged-in users sync to SQLite
- Level IDs are sequential integers starting from 1; chapter assignment is a property on each level
