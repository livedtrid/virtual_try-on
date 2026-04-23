# Backend Repo (Split-Ready)

This folder is ready to become the standalone backend repository.

## Scope

- FastAPI API (`/health`, `/tryon`)
- Request validation and error mapping in routes
- Vertex AI integration isolated in `app/services/vertex_tryon.py`

## Shared API Contract (Frontend <-> Backend)

The backend exposes:

- `GET /health` -> `{ "status": "ok" }`
- `POST /tryon` with multipart:
  - `person_image` (image)
  - `garment_image` (image)

Response JSON:

```json
{
  "mime_type": "image/png",
  "image_base64": "..."
}
```

Keep `image_base64` in the response payload to avoid breaking the frontend.

## Local Test Command

```bash
pytest
```

## CI (Azure DevOps)

`azure-pipelines.yml` runs:

- Python setup
- `pip install -r requirements.txt`
- `pytest`

