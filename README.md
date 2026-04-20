# Virtual Try-On PoC

A proof-of-concept Virtual Try-On experience with a static React frontend and an external FastAPI backend.

## Architecture

- `frontend/` - React + Vite static app (deployable to GitHub Pages)
- `backend/` - FastAPI API with `/health` and `/tryon`
- `backend/app/services/vertex_tryon.py` - isolated service seam for Vertex AI logic

## Current Product UX

- Product cards are rendered from `frontend/src/products.js`.
- The try-on panel is hidden by default and only opens after clicking `Experimentar agora` on a product image.
- The CTA is shown as an overlay in the bottom-right of each try-on-enabled product image (`frontend/src/App.jsx`).
- The widget no longer uses a product dropdown; the selected card drives garment selection.
- In the widget, users can upload an image or capture one from camera (`frontend/src/components/ImageUploader.jsx`).

## Local Development

### Prerequisites

| Tool | macOS | Windows |
|---|---|---|
| Python 3.11+ | `brew install python` | [python.org](https://www.python.org/downloads/) — check **"Add to PATH"** during install |
| Node.js 18+ | `brew install node` | [nodejs.org](https://nodejs.org/) |
| PowerShell 7+ | — | Pre-installed on Windows 10/11; update at [github.com/PowerShell](https://github.com/PowerShell/PowerShell/releases) |

> **Windows note:** The first time you run a `.ps1` script you may need to allow local scripts:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### One-command startup (backend + frontend)

**macOS / Linux:**
```bash
./run-local.sh
```

**Windows (PowerShell):**
```powershell
.\run-local.ps1
```

These scripts start both services, auto-create `backend/.venv` and `frontend/.env` when missing, and install dependencies on first run.

Optional custom ports — macOS/Linux:
```bash
BACKEND_PORT=8081 FRONTEND_PORT=5174 ./run-local.sh
```

Optional custom ports — Windows:
```powershell
$env:BACKEND_PORT=8081; $env:FRONTEND_PORT=5174; .\run-local.ps1
```

### One-command startup in Vertex mode

**macOS / Linux:**
```bash
GOOGLE_CLOUD_PROJECT=your-project-id ./run-local-vertex.sh
```

**Windows (PowerShell):**
```powershell
$env:GOOGLE_CLOUD_PROJECT="your-project-id"; .\run-local-vertex.ps1
```

Optional settings — macOS/Linux:
```bash
GOOGLE_CLOUD_PROJECT=your-project-id \
GOOGLE_CLOUD_LOCATION=us-central1 \
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json \
./run-local-vertex.sh
```

Optional settings — Windows:
```powershell
$env:GOOGLE_CLOUD_PROJECT="your-project-id"
$env:GOOGLE_CLOUD_LOCATION="us-central1"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
.\run-local-vertex.ps1
```

### One-command startup in Vertex mode with API Key

**macOS / Linux:**
```bash
VERTEX_API_KEY=AIza... ./run-local-apikey.sh
```

**Windows (PowerShell):**
```powershell
$env:VERTEX_API_KEY="AIza..."; .\run-local-apikey.ps1
```

In API-key mode, the launchers clear `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `GOOGLE_APPLICATION_CREDENTIALS` to avoid conflicting auth paths.

Optional model overrides:

```powershell
$env:VTO_VIRTUAL_TRY_ON_MODEL="virtual-try-on-001"
$env:VTO_IMAGE_GENERATION_MODEL="imagen-4.0-generate-001"
```

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

- `https://livedtrid.github.io/virtual_try_on/`

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
- Defaults from `VertexConfig` in `backend/app/services/vertex_tryon.py`:
  - `VTO_VIRTUAL_TRY_ON_MODEL=virtual-try-on-001`
  - `VTO_IMAGE_GENERATION_MODEL=imagen-4.0-generate-001`
  - `VTO_PERSON_GENERATION=ALLOW_ALL`

## ZScaler / Corporate Proxy

If you are behind ZScaler or another TLS-inspecting proxy the Vertex AI SDK will fail to connect because it does not trust the corporate root certificate.

Both `run-local-vertex.sh` and `run-local-apikey.sh` handle this automatically on macOS: they export the system keychain (which includes the ZScaler root CA when installed via MDM) into a PEM bundle and set `REQUESTS_CA_BUNDLE`, `SSL_CERT_FILE`, and `GRPC_DEFAULT_SSL_ROOTS_FILE_PATH` before starting the backend.

You will see a log line like:

```
[vertex] Exported macOS system keychain as CA bundle (includes ZScaler if installed via MDM): /tmp/vto-system-ca-bundle.pem
```

If you need to point to a specific cert file instead:

```bash
VTO_CA_BUNDLE=/path/to/zscaler-ca.pem GOOGLE_CLOUD_PROJECT=my-project ./run-local-vertex.sh
```

All Google Cloud integration stays isolated in `backend/app/services/vertex_tryon.py`.
