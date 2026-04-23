# Repo Split Checklist (Monorepo -> 3 Azure DevOps Repos)

Current monorepo note: shared helper scripts already live in `ops-docs/scripts/`.

## Target repos
1. `google-virtual-try-on-frontend`
2. `google-virtual-try-on-backend`
3. `google-virtual-try-on-ops-docs`
## Extraction map
- Move `frontend/` -> frontend repo root
- Move `backend/` -> backend repo root
- Move `ops-docs/` -> ops/docs repo root
## Post-split tasks
- Add branch policies on `main` for all repos
- Enable CI pipeline per repo using `azure-pipelines.yml`
- Configure `VITE_API_BASE_URL` in frontend pipeline per environment
- Keep API contract copied from `templates/api-contract.md` in both app repos
- Keep shared helper scripts in `ops-docs/scripts/` or copy only the repo-specific ones into each extracted repo as needed
