# Shared API Contract

Frontend and backend repos must stay aligned on these endpoints.

## Health

- `GET /health`
- Response:

```json
{ "status": "ok" }
```

## Try-On

- `POST /tryon`
- Request: `multipart/form-data`
  - `person_image` (image)
  - `garment_image` (image)
- Response:

```json
{
  "mime_type": "image/png",
  "image_base64": "..."
}
```

## Compatibility Note

`image_base64` is required by the frontend. Removing or renaming it is a breaking change.

