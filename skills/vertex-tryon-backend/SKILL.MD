# Vertex Try-On Backend

Use this skill whenever creating or editing backend code related to Google Vertex AI Virtual Try-On.

## Objective

Implement a clean FastAPI backend integration for the Virtual Try-On model.

## Rules

- Keep all Google-specific code in `backend/app/services/vertex_tryon.py`
- Route handlers must stay thin
- Validate image MIME types
- Return JSON with:
    - mime_type
    - image_base64
- Use environment variables for configuration
- If credentials are not available, implement a mock path with clear TODOs

## Backend shape

- app/main.py
- app/routes/health.py
- app/routes/tryon.py
- app/services/vertex_tryon.py

## Preferred endpoint contract

GET /health
POST /tryon with multipart form data:
- person_image
- garment_image

## Error handling

- 400 for invalid inputs
- 502 for upstream Vertex AI failures

## Important

Use the Google notebook only as API reference.
Do not generate notebook-style code.
Do not include Colab commands.