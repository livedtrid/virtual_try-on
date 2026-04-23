# Ops / Docs Repo (Split-Ready)

This folder is intended to become a small third repository for shared operational docs and templates.

## Intended Contents

- Reusable CI templates for Azure DevOps
- Shared API contract snippet for frontend/backend repos
- Deployment runbooks (Google Cloud, Azure DevOps)
- Migration checklists for onboarding and repo split tasks

## Suggested Repo Name

- `google-virtual-try-on-ops-docs`

## Suggested Extraction Command

From this monorepo root:

```bash
git subtree split --prefix=ops-docs -b ops-docs-split
```

Then push `ops-docs-split` to the new Azure DevOps repo.

