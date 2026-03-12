# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shelfmark is a self-hosted web application for searching and downloading books and audiobooks from multiple sources. Full-stack: Python/Flask backend with React/TypeScript frontend. Runs in Docker.

## Development Commands

### Frontend (from repo root)
```bash
make install        # npm install in src/frontend
make dev            # Vite dev server on localhost:5173 (proxies API to :8084)
make build          # Production build to src/frontend/dist
make typecheck      # TypeScript type checking (tsc --noEmit)
make frontend-test  # Frontend unit tests
make build-serve    # Build frontend and sync to frontend-dist/ for Flask to serve
```

### Backend (Docker-based)
```bash
make up             # Start via docker-compose.dev.yml
make down           # Stop services
make refresh        # Full rebuild and restart
make restart        # Restart without rebuild
```

The backend mounts `./shelfmark:/app/shelfmark:ro` and `./frontend-dist:/app/frontend-dist:ro`, so Python changes are live-reloaded but frontend changes need `make build-serve`.

### Testing (runs inside Docker container)
```bash
# Unit tests (fast, no external deps)
docker exec test-cwabd python3 -m pytest tests/ -v -m "not integration and not e2e"

# E2E API tests (requires running app)
docker exec test-cwabd python3 -m pytest tests/e2e/ -v -m e2e

# Single test file
docker exec test-cwabd python3 -m pytest tests/prowlarr/test_clients.py -v

# Single test
docker exec test-cwabd python3 -m pytest tests/e2e/test_api.py::TestHealthEndpoint::test_health_returns_ok -v

# Integration tests (requires docker-compose.test-clients.yml stack)
docker compose -f docker-compose.test-clients.yml up -d
docker exec test-cwabd python3 -m pytest tests/prowlarr/ -v -m integration
```

Test markers: `integration` (requires services), `e2e` (requires running app), `slow`.

## Architecture

### Backend (`shelfmark/`)
- **`main.py`** — Flask app with all HTTP routes and WebSocket handlers (~2800 lines). This is the central routing file.
- **`core/`** — Application logic: user database (`user_db.py` with SQLite), download queue (`queue.py`), auth modes (`auth_modes.py`, `oidc_auth.py`), settings management, notifications, activity tracking, request system
- **`config/`** — Environment variables (`env.py`), dynamic settings registry (`settings.py`, `settings_registry.py`), database migrations
- **`download/`** — Download orchestration: `orchestrator.py` (queue worker), `network.py`/`http.py` (downloaders), `clients/` (qBittorrent, Transmission, Deluge, rTorrent, SABnzbd, NZBGet), `outputs/` (folder, email, Booklore), `postprocess/` (pipeline, transfer, scan)
- **`release_sources/`** — Plugin-style source system: `direct_download.py` (web scraping), `prowlarr/` (torrent/usenet indexer), `audiobookbay/` (audiobook torrents), `irc/` (IRC/DCC transfers)
- **`metadata_providers/`** — Book metadata: `hardcover.py` (primary, 99KB), `openlibrary.py`, `googlebooks.py`
- **`api/websocket.py`** — WebSocket manager with room-based filtering (admins, per-user)
- **`bypass/`** — Cloudflare bypass via headless Chromium or external solvers

### Frontend (`src/frontend/`)
- React 18 + TypeScript + Vite + TailwindCSS 4
- `@/*` path alias maps to `src/frontend/src/*`
- `App.tsx` — Root component with routing and search logic
- `components/` — UI components (SearchBar, ReleaseModal, Header, settings/, activity/)
- `services/api.ts` — All HTTP/REST API calls
- Real-time updates via Socket.IO client

### Data Storage
- SQLite database at `/config/users.db` (users, settings, requests, download history)
- JSON settings at `/config/plugins/advanced.json`
- No migration framework — schema created on first run, settings managed dynamically via registry

### Key Environment Variables
- `FLASK_PORT=8084`, `FLASK_HOST=0.0.0.0`
- `CONFIG_DIR=/config`, `INGEST_DIR=/books`, `TMP_DIR=/tmp/shelfmark`
- `SEARCH_MODE=direct|universal`
- `DEBUG=false`, `LOG_LEVEL=INFO`

### Auth System
Four modes: builtin (username/password), OIDC (SSO), proxy auth (reverse proxy headers), Calibre-Web database. Multi-user with admin/user roles, per-user settings overrides, and request approval workflows.

## Project Scope

Shelfmark is a manual search-and-download tool, not a library manager. It does not track libraries, monitor releases, or queue future downloads. Feature work focuses on stability, bug fixes, and search experience improvements.
