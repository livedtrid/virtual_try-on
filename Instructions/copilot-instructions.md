# Repository custom instructions

This repository is a Proof of Concept for a Virtual Try-On (VTO) experience.

## Non-negotiable architecture rules

- The frontend is a static React + Vite app.
- The frontend must stay deployable to a static host such as Azure Static Web Apps.
- Static hosting means backend logic must never move into the frontend.
- Never call Google Vertex AI directly from the browser with credentials.
- All Google Cloud / Vertex AI logic must live in the backend.
- The backend is Python + FastAPI.
- The backend must expose at least:
    - GET /health
    - POST /tryon
- The frontend must call the backend through a configurable API base URL.

## Scope control

This is a PoC.
Prioritize:
- working local flow
- clean architecture
- simple UX
- mock PDP
- image upload
- try-on request
- result preview

Do not prioritize:
- real-time AR
- MediaPipe camera tracking
- Sitecore integration
- production auth
- analytics integration
- advanced design systems

## Delivery order

Always work in this order unless explicitly told otherwise:
1. backend health endpoint
2. backend try-on endpoint with mock response
3. frontend PDP mock
4. frontend upload flow
5. frontend-to-backend integration
6. real Vertex AI integration
7. static hosting deployment

## Code style

- Prefer small, complete, working files
- Avoid over-engineering
- Keep functions focused
- Add only useful comments
- Use clear names
- Add basic error handling
- Keep secrets out of source control

## Validation before proposing completion

Before saying a task is complete, verify:
- Does the frontend still stay static?
- Is the backend still the only place calling Vertex AI?
- Can the code run locally?
- Is the change aligned with PoC scope?