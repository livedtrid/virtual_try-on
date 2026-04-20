# AGENTS.md

## Purpose
- This repo is a PoC virtual try-on stack: React frontend (`frontend/`) + FastAPI backend (`backend/`) + optional static export to `docs/`.
- Keep Google/Vertex-specific logic isolated in `backend/app/services/vertex_tryon.py`; routes should stay provider-agnostic.

## Architecture And Data Flow
- UI entry is `frontend/src/App.jsx`; user flow is implemented in `frontend/src/components/TryOnWidget.jsx`.
- Product choices are static in `frontend/src/components/ProductSelector.jsx` and loaded from `frontend/public/products/*` via `import.meta.env.BASE_URL`.
- `frontend/src/api.js` is the frontend API seam: it normalizes uploads to PNG (`ensurePng`) and posts multipart fields `person_image` + `garment_image` to `/tryon`.
- Backend wiring is in `backend/app/main.py` (`health_router`, `tryon_router`, permissive CORS for PoC).
- `backend/app/routes/tryon.py` performs request validation (image mime types, non-empty payload), then calls `run_virtual_tryon(...)`.
- `backend/app/services/vertex_tryon.py` selects mock vs Vertex mode using `VTO_USE_VERTEX`; mock returns the original person image as base64.

## Developer Workflows
- Preferred local start is root scripts, not manual multi-terminal setup:
  - Windows: `run-local.ps1`, `run-local-vertex.ps1`, `run-local-apikey.ps1`
  - macOS/Linux: `run-local.sh`, `run-local-vertex.sh`, `run-local-apikey.sh`
- `run-local.ps1` bootstraps `backend/.venv`, installs `backend/requirements.txt`, installs `frontend/node_modules`, creates `frontend/.env` from `.env.example`, then starts backend/frontend.
- Manual backend run (if needed): `uvicorn app.main:app --reload --port 8080` from `backend/`.
- Backend tests live in `backend/tests/test_api.py`; run with `pytest` from `backend/` (`backend/pytest.ini` sets `pythonpath = .`).
- Static site publish path uses `frontend/package.json` script `build:docs` (build then move `dist` to `../docs`); helper script is `deploy-to-docs.sh`.

## Project-Specific Conventions
- Preserve API contract from `README.md`: `POST /tryon` returns `{ mime_type, image_base64 }`; frontend expects `image_base64` and throws if missing (`frontend/src/api.js`).
- Keep try-on routes thin: validation + error mapping in route layer, provider calls inside service layer (`tryon.py` -> `vertex_tryon.py`).
- Error semantics are intentional in `tryon.py`: `RuntimeError` -> HTTP 500, other exceptions -> HTTP 502 with `Virtual try-on request failed: ...`.
- Frontend always sends PNG to backend (do not bypass `ensurePng` unless backend contract changes).
- Logging is part of diagnosis flow: startup env summary in `backend/app/main.py`, request/response telemetry in `tryon.py` and `vertex_tryon.py`.

## Integration Points And Env
- Frontend backend URL is `VITE_API_BASE_URL` (`frontend/.env.example`, `frontend/src/api.js`).
- Vertex mode envs:
  - ADC mode: `VTO_USE_VERTEX=true`, `GOOGLE_CLOUD_PROJECT`, optional `GOOGLE_CLOUD_LOCATION`, optional `GOOGLE_APPLICATION_CREDENTIALS`
  - API key mode: `VTO_USE_VERTEX=true`, `VTO_AUTH_MODE=api_key`, `VERTEX_API_KEY`, `GOOGLE_CLOUD_PROJECT`, optional `GOOGLE_CLOUD_LOCATION`
- Corporate TLS/proxy support uses CA bundle env vars (`REQUESTS_CA_BUNDLE`, `SSL_CERT_FILE`, `GRPC_DEFAULT_SSL_ROOTS_FILE_PATH`) propagated by vertex run scripts and consumed in `vertex_tryon.py`.
- Keep generated `docs/assets/*` as build output from `frontend/`; edit source under `frontend/src/` and rebuild instead.

