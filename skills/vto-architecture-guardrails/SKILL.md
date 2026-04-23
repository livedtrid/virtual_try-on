# VTO Architecture Guardrails

Use this skill whenever working on architecture, repo scaffolding, frontend/backend boundaries, or implementation planning.

## Project truth

- Frontend: React + Vite
- Hosting target: static hosting (for example Azure Static Web Apps)
- Backend: Python + FastAPI
- AI integration: Vertex AI Virtual Try-On
- Frontend is static only
- Backend owns all cloud credentials and all Vertex AI calls

## Hard constraints

- Do not implement server-side behavior in the frontend
- Do not expose secrets in browser code
- Do not recommend direct browser auth to Vertex AI
- Do not introduce unnecessary infrastructure
- Do not implement ARCore/MediaPipe unless explicitly requested later
- Do not add Sitecore integration in the PoC
- Do not add analytics platforms in the PoC

## Expected implementation pattern

- frontend/
    - mock PDP
    - upload UI
    - call backend
    - render image result

- backend/
    - /health
    - /tryon
    - services/vertex_tryon.py

## When reviewing code

Flag these as architectural errors:
- direct Google SDK usage in React
- hardcoded secrets
- repo setup that cannot deploy the frontend as a static site
- trying to solve camera AR before image upload flow is working