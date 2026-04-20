# Virtual Try-On PoC

A proof-of-concept Virtual Try-On experience with a static React frontend and an external FastAPI backend.

## Architecture

- `frontend/` - React + Vite static app (deployable to GitHub Pages)
- `backend/` - FastAPI API with `/health` and `/tryon`
- `backend/app/services/vertex_tryon.py` - isolated service seam for Vertex AI logic

## Local Development

### One-command startup (backend + frontend)

```bash
./run-local.sh
```

This script starts both services, auto-creates `backend/.venv` and `frontend/.env` when missing, and installs dependencies on first run.

Optional custom ports:

```bash
BACKEND_PORT=8081 FRONTEND_PORT=5174 ./run-local.sh
```

### One-command startup in Vertex mode

```bash
GOOGLE_CLOUD_PROJECT=your-project-id ./run-local-vertex.sh
```

Optional settings:

```bash
GOOGLE_CLOUD_PROJECT=your-project-id \
GOOGLE_CLOUD_LOCATION=us-central1 \
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json \
./run-local-vertex.sh
```

`run-local-vertex.sh` sets `VTO_USE_VERTEX=true` and then starts both services through `run-local.sh`.

### One-command startup in Vertex mode with API Key

If you have a GCP API key (with Vertex AI API enabled) and prefer not to use a service account:

```bash
GOOGLE_CLOUD_PROJECT=your-project-id VERTEX_API_KEY=AIza... ./run-local-apikey.sh
```

Optional settings:

```bash
GOOGLE_CLOUD_PROJECT=your-project-id \
VERTEX_API_KEY=AIza... \
GOOGLE_CLOUD_LOCATION=us-central1 \
./run-local-apikey.sh
```

`run-local-apikey.sh` sets `VTO_USE_VERTEX=true` and `VTO_AUTH_MODE=api_key`, then starts both services through `run-local.sh`.

### 1) Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### 2) Run frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend defaults to calling `http://localhost:8080` through `VITE_API_BASE_URL`.

## API Contract

### `GET /health`

Response:

```json
{ "status": "ok" }
```

### `POST /tryon`

Multipart form fields:

- `person_image` (image)
- `garment_image` (image)

Response:

```json
{
  "mime_type": "image/png",
  "image_base64": "..."
}
```

## GitHub Pages Deployment (Frontend)

This repo is configured with `/.github/workflows/deploy.yml` to build `frontend/` and deploy `frontend/dist` to Pages.

The Vite base path is set in `frontend/vite.config.js` as:

- `/virtual_try-on/`

That matches:

- `https://livedtrid.github.io/virtual_try-on/`

## Connecting Frontend to Backend

Set the backend URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For deployed frontend, set this to your deployed backend URL and rebuild.

## Mock vs Real Vertex AI

Current default is mock mode in `backend/app/services/vertex_tryon.py`.

- Mock mode (`VTO_USE_VERTEX=false`) returns the uploaded person image.
- Vertex mode (`VTO_USE_VERTEX=true`) calls Google Vertex AI through `google-genai`.

Vertex mode env vars:

- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION` (default `us-central1`)
- `VTO_USE_VERTEX=true`
- `VTO_AUTH_MODE` — `adc` (default) or `api_key`
  - `adc`: uses Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS`
  - `api_key`: uses a plain GCP API key set in `VERTEX_API_KEY`

All Google Cloud integration stays isolated in `backend/app/services/vertex_tryon.py`.
