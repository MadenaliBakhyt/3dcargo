# Cargo Loading Planner

A tool for planning and visualizing the loading of cargo into trucks and containers. Pick a
vehicle, describe your cargo, click **"Рассчитать размещение"**, and get a real 3D bin-packing
result: how many vehicles you need, exactly where every item goes, how full each vehicle is, and
where the center of gravity ends up — plus a 3D scene, 2D floor plans, and PDF/CSV/JSON export.

This is a focused calculation tool, not a SaaS platform: no accounts, no database, no backend
persistence. Your project lives in the browser (`localStorage`) and can be exported/imported as
JSON.

## What it does

- Choose a vehicle from six built-in templates (curtain-side trucks, mega trailer, 20'/40'/40' HC
  containers) or define your own dimensions and payload capacity.
- Add one or more cargo types with full physical properties: dimensions, weight, quantity,
  package type, allowed rotations, stacking rules, fragility, max load on top, and priority.
- Run a real 3D bin-packing algorithm (not a volume-only estimate) that respects collisions,
  container bounds, weight limits, physical support, and stacking rules, and spreads cargo across
  multiple vehicles when it doesn't fit in one.
- Inspect the result in an interactive 3D scene (orbit/pan/zoom, view presets, wall visibility,
  center-of-gravity marker, click-to-inspect, loading-order animation) and in 2D top/front/side
  projections.
- Export the plan as PDF (with a loading scheme), CSV (placement table), or JSON (full project),
  and re-import a JSON project later. Import cargo lists from CSV too.

## Tech stack

- **Frontend**: Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS + shadcn/ui-style
  components + Zustand (state, persisted to `localStorage`) + React Hook Form + Zod.
- **3D**: Three.js via React Three Fiber + drei.
- **Backend**: Python + FastAPI + Pydantic. A single calculation endpoint; no database.
- **Algorithm**: pure Python, described below.
- **Testing**: pytest (backend), Vitest (frontend units), Playwright (E2E).

## Project structure

```
backend/
  app/
    main.py               FastAPI app
    api/calculate.py      POST /api/calculate, GET /api/health
    schemas/               Pydantic request/response models
    services/               calculation orchestration, statistics, result validation
    algorithms/             the packing engine (see below)
    tests/                 pytest suite
frontend/
  app/                    Next.js routes
  components/             UI, grouped by feature (transport, cargo, calculator, results, viewer, export)
  stores/                 Zustand store (persisted project state)
  lib/                    API client, validation schemas, presets, export helpers
  types/                  TypeScript types mirroring the backend schemas
  tests-e2e/              Playwright specs
docker-compose.yml
```

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000   # pick any free port instead of 8000
```

The API is now at `http://localhost:8000` (`/docs` for the OpenAPI UI, `/api/health` for a health
check).

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to match the backend port above
npm run dev -- -p 3000              # pick any free port instead of 3000
```

Open `http://localhost:3000`. Click **"Попробовать демо"** for an instant real calculation (Euro
truck 86 m³, 15 EURO pallets 120×80×160 cm / 450 kg).

### Docker

```bash
docker compose up --build
```

Frontend on `:3000`, backend on `:8000` by default.

**If those ports are already taken on your server**, copy `.env.example` to `.env` and set
`BACKEND_PORT` / `FRONTEND_PORT` to free ones — `docker-compose.yml` reads them and also derives
the frontend's `NEXT_PUBLIC_API_URL` build arg from `BACKEND_PORT` automatically:

```bash
cp .env.example .env
# edit .env: BACKEND_PORT=8001, FRONTEND_PORT=3001
docker compose up --build
```

Or without a `.env` file:

```bash
BACKEND_PORT=8001 FRONTEND_PORT=3001 docker compose up --build
```

If the frontend is reached through a different host/domain than the backend (e.g. behind a
reverse proxy), set `NEXT_PUBLIC_API_URL` explicitly in `.env` instead of relying on the
`BACKEND_PORT`-derived `localhost` default — it's what the *browser* uses to reach the API, not
the frontend container.

## Testing

```bash
# backend
cd backend && source .venv/bin/activate
pytest
ruff check app/

# frontend
cd frontend
npm run typecheck
npm run lint
npm test            # Vitest unit tests
npm run build
npm run e2e          # Playwright, needs the dev server (or docker compose) running
```

## The packing algorithm

Backend units are always centimeters and kilograms; the frontend converts for display only.

**Coordinate system**: `X` = length, `Y` = width, `Z` = height (up), origin at the
front-bottom-left corner of the vehicle. Every placement returns the item's rotated `x, y, z` and
its post-rotation `length, width, height`, so the frontend never has to compute rotations itself.

**Pipeline** (`services/calculation_service.py` → `algorithms/bin_packing.py`):

1. Validate the request and expand each cargo type's `quantity` into individually-tracked
   instances (`{cargoId}-001`, `-002`, ...).
2. Filter out cargo that cannot possibly fit in an *empty* vehicle (too large in every allowed
   orientation, or heavier than the vehicle's payload capacity) — these are reported as unplaced
   with a reason and never enter the packing loop.
3. Run several fast heuristics that differ in sort order (priority → largest volume first /
   largest base area first / heaviest first) and placement strategy (first-fit vs. an
   exhaustive-candidate best-fit), each using the same placement primitives:
   - **Candidate points**: instead of scanning every coordinate, only the corners exposed by
     already-placed boxes (plus the origin) are considered — the standard extreme-point technique
     for 3D bin packing.
   - **Bottom-Left-Back** ordering of candidate points, so boxes settle toward the floor and the
     front-left corner, producing a dense pack.
   - **AABB collision detection** against a uniform spatial grid (not an O(n²) scan against every
     placed item), for bounds/collision checks that stay fast past thousands of items.
   - **Physical support checking**: an item may only rest where the floor or the tops of other
     items cover enough of its base (a configurable ratio, default 75%) — no floating cargo.
   - **Stacking rules**: fragile items can't have anything placed on them; `stackable: false`
     items must sit directly on the floor; `maxStackTiers` / `maxStackHeight` / `maxTopLoad` are
     enforced against the actual support chain (top-load capacity accounts for everything stacked
     above an item, not just what touches it directly).
   - **Rotation**: horizontal rotation (swap length/width) is allowed by default; full vertical
     tipping is opt-in per cargo type.
   - When a vehicle is full, a new one is opened automatically (first-fit-decreasing across bins),
     respecting `maxTrucks`.
4. Each strategy's full multi-vehicle result is scored — fewest vehicles first, then highest
   average volume utilization, then better weight balance — and the best-scoring result wins.
5. The chosen result is re-validated end to end (`services/validation_service.py`): every item is
   inside its vehicle, no two items overlap, no vehicle exceeds its weight limit, every
   above-floor item has recorded physical support. Any violation is surfaced as a warning — this
   should never trigger with correct input, but it's a safety net rather than blind trust in the
   algorithm's own bookkeeping.
6. Statistics (volume/weight/floor utilization, free volume, weighted center of gravity per
   vehicle) and the final response are assembled.

Because 3D bin packing is NP-hard, results are described as an "optimized" or "best found"
placement — never as mathematically optimal.

## API

Intentionally minimal — this app doesn't need more than one real endpoint:

- `POST /api/calculate` — body: `{ transport, cargoTypes, settings }`, returns placements,
  per-vehicle and overall statistics, unplaced items with reasons, and warnings.
- `GET /api/health` — liveness check.

## Notes on scope

No accounts, no database, no admin panel, no AI assistant, no billing — by design. State lives in
the browser; projects are portable via JSON export/import.
