# Repo Split Checklist (Monorepo -> 3 Azure DevOps Repos)
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
- Remove monorepo-specific scripts (`run-local*.ps1/.sh`) or re-home them into ops/docs