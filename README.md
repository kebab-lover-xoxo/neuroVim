# NeuroVim

I love learning, I learn a lot, I fail a lot becuase I am to busy learning a lot. Learning a lot of systems leads to being a master of none. I need to be a master of some if I want to be exceptional. Being Exceptional requires knowing a lot about a lot, and learning what you don't know before you find out what you don't know. This leads to Learning FOMO, I have learning FOMO, I need a learning fomo solution to get more out of my work day so I don't get fomo. 

NeuroVim is an application designed to be my work software, I have not decided anything deeper, but I want to try Rust for intentionally learning _memory safe code_ and applying mystical abstract algebra stuff I saw online to further improve my 0 branch architecture but this requires a whole new uncomfortable framework with WASM.

## What to expect
* An application
* A learning tool inspired by vim that will likely use latex or an adjacent framework, feature a jet black terminal with slate features and do cool stuff

## Features I hope to implement
* zettlekasten notes
* 5-9 topic limit in one session, quick session reviews to help organize various systems
* A very very very intentionally simple interface so all there is to do is learn
* A fsrs memory retention algorithm of some kind for active recall
* seperate the interface into a split intention system between three archetypes, Notes, Working and Recall.
* At some point I will add a youtubeto script to flashcards feature for some of the content rich videos I watch.

## design constraints
Model it around research, this is research backed, I read a few learning articles for understanding things faster that the application will implement. 

* Semantic memory
* episodic memory/retrieval
* Active Recall (sridhar et al)
  * This particular system was a major gap in previous learning-flows as I assumed active recall was active Learning but it is a sect of it, the other major unit is active understanding.
* Active Understanding what the previous learning model lacked. using DMN (Default Mode Network)
* Millers law 7 Item retention limitation can be hacked using methods
* Chunking, Schema Construction, Extraneous Load, Germane Load
* Feynman Technic (Gyrokos n.d.)
* pomodoro (I have already covered this)

Ironically, some of these can be applied to ai,
I will also be adding ai but, to solve a slightly different problem,

>Does AI really assist in learning some articles and professors will likely say no, 
>Hopefully, this one will.

The idea is to design an ai with intentional constraints that prevent it from answer leaking and force a "Socratic Scaffolder" Now it answers a question with a question, but this question targets link in a user's knowledge chain of a system or topic.

---

## Sprint 0 — Ready for Flight ✅

The foundational infrastructure is complete:

### Monorepo Structure
- **packages/core** — TypeScript library with SQLite integration, FSRS types, and database initialization
- **packages/ui** — React + Vite app with client-side routing for three archetype panes (Notes, Working, Recall)
- **apps/web** — Express server serving the static UI and providing health/info API endpoints
- **Workspace Protocol** — All local dependencies resolve through `workspace:*` with a single `pnpm-lock.yaml`

### Database & Persistence
- **SQLite v3 Schema** — 12 tables (topics, notes, cards, sessions, reviews, fsrs_params, etc.) with FK constraints and indexes
- **WAL Mode** — Write-Ahead Logging enabled on every connection for concurrent read/write support
- **FSRS-5 Seed** — Default weight set seeded at startup; seeds idempotently via migration
- **Volume Mount** — `./data:/data` in Docker ensures database survives container restarts/rebuilds

### Containerization
- **Multi-stage Dockerfile** — Builder stage compiles all packages; runner stage serves static UI + API
- **Docker Compose** — Production and dev configs with hot reload, Vite HMR, and source volume mounts
- **Port 3000** — Single exposed port for the full stack

### Developer Tooling
- **TypeScript** — `strict: true` enforced across all packages; `tsc --noEmit` baseline established
- **ESLint** — @typescript-eslint/recommended + react-hooks/rules-of-hooks configured
- **Prettier** — Project-specific style rules (singleQuote, no semi, 100 char line width)
- **Scripts** — `pnpm typecheck`, `pnpm lint`, `pnpm format:check` for CI/pre-commit

### Routes & UI
- `/notes` — Notes archetype stub
- `/working` — Working archetype stub
- `/recall` — Recall archetype stub
- `/api/health` — Server health endpoint
- `/api/info` — App info endpoint

## Setup

```bash
# From the repository root (/workspaces/neuroVim)
corepack enable
pnpm install

# Development
docker compose up --build

# Type-check, lint, format
pnpm typecheck && pnpm lint && pnpm format:check
```

Access the app at `http://localhost:3000` after the container starts.
