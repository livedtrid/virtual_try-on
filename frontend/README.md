# Frontend Repo (Split-Ready)

This folder is ready to become the standalone frontend repository.

## Scope

- React + Vite storefront UI
- Virtual Try-On widget flow (camera modal, preview, loading, result)
- Calls backend API via `VITE_API_BASE_URL`

## Shared API Contract (Frontend <-> Backend)

The frontend expects:

- `GET /health` -> `{ "status": "ok" }`
- `POST /tryon` with multipart:
  - `person_image` (image)
  - `garment_image` (image)
- Response JSON:

```json
{
  "mime_type": "image/png",
  "image_base64": "..."
}
```

`image_base64` is required by `src/api.js`.

## Environment Files

- Local: `.env.example` (copy to `.env`)
- Split targets:
  - `.env.development.example`
  - `.env.staging.example`
  - `.env.production.example`

## CI (Azure DevOps)

`azure-pipelines.yml` runs:

- `npm ci`
- `npm run build`

