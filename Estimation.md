# Virtual Try-On Implementation Estimation

## Executive Summary
This document provides an effort and budget estimate to evolve the current PoC into a client-ready Virtual Try-On solution integrated into an existing e-commerce storefront.

### At a glance
| Item | Estimate |
|---|---|
| Delivery effort | 424-616 person-hours |
| Delivery budget | EUR 23,850-EUR 53,900 |
| Recommended budget envelope | EUR 35k-EUR 55k |
| Timeline (lean team) | 8-12 weeks |
| Timeline (fuller team) | 6-9 weeks |
| Confidence level | Medium (+/-30%) |

---

## 1) Scope and Objective

### Objective
Deliver modular frontend and backend capabilities that enable Virtual Try-On in the client's existing storefront, including quality assurance, release readiness, and technical handover.

### Scope in
- Frontend modules to plug into an existing production storefront (React)
- Backend API and service layer for virtual try-on processing (FastAPI)
- QA, release readiness, and handover
- Ongoing backend hosting and operations cost estimate

### Scope out
- Full storefront maintenance
- Full redesign of the client's website

---

## 2) Estimation Assumptions
- Baseline productivity uses a mid-senior engineer profile.
- Existing PoC is functional but requires production hardening.
- Client storefront already exists; implementation is delivered as modular integration.
- Security, logging, monitoring, and error handling require production-grade completion.
- Estimate confidence is medium (+/-30%) at current discovery depth.
- Effort conversion: 1 person-day = 8 hours.

---

## 3) Delivery Breakdown

### Frontend deliverables (React modules)
- Product gallery integration with "Try on" entry points
- Upload/camera capture flow module
- Result preview module and retry flow
- Frontend API adapter (request normalization, error handling, timeout/retry)
- Integration guide for client storefront team

### Backend deliverables (FastAPI service)
- `/health` and `/tryon` endpoints with validation and error mapping
- Service layer abstraction for provider calls
- Auth/config handling for runtime modes
- Structured logging and diagnostics
- Basic throttling/guardrails for payload size and failure handling

### Quality and release deliverables
- Test coverage (API contract + frontend critical flows)
- UAT support and bug-fix window
- Deployment and runbook documentation
- Handover workshop with client tech team

---

## 4) Effort Estimate (Base Case)

### Work breakdown by module
| Module | Effort (person-hours) | Notes |
|---|---:|---|
| Requirements refinement + technical discovery | 32-48 | Clarify integration points, user journeys, and non-functional requirements |
| UX/UI hardening (flows, states, edge cases) | 40-64 | Production-level interaction states and accessibility review |
| Frontend module implementation (React) | 80-112 | Camera/upload, try-on trigger points, result rendering, error UX |
| Backend API + service hardening (FastAPI) | 80-112 | Validation, resilience, telemetry, config/auth modes |
| Integration + contract stabilization | 40-56 | Align frontend/backend contracts and client integration adapters |
| QA strategy + execution + regression | 64-96 | Test design, manual/automated checks, fixes verification |
| DevOps/release setup + runbooks | 32-48 | Environment configuration, release process, operational docs |
| Buffer/risk reserve (15-20%) | 56-80 | Covers unknowns and integration risk |
| **Total** | **424-616** | **~2.5 to 3.5 person-months** |

### Timeline (calendar)
- Lean team (2-3 people): 8-12 weeks
- Fuller team (4-5 people): 6-9 weeks

---

## 5) Team Model

### Recommended team and responsibilities
| Role | Allocation | Key responsibilities | Core stack |
|---|---|---|---|
| Product/Delivery Lead | 20-30% | Scope, planning, stakeholder alignment, delivery tracking | Jira/Linear, Confluence/Docs |
| UX/UI Designer | 30-50% | UX flows, responsive states, accessibility, handoff specs | Figma, design system tokens |
| Frontend Engineer (mid-senior) | 100% | React modules, storefront integration, API seam, state/error handling | React, Vite, JavaScript/TypeScript, CSS |
| Backend Engineer (mid-senior) | 100% | API endpoints, service layer, resilience, observability, config/auth | Python, FastAPI, Pydantic, Uvicorn |
| QA Engineer | 50-100% | Test plan, regression, UAT support, quality sign-off | Playwright/Cypress, Postman, pytest |
| DevOps/Cloud Engineer | 20-40% | Runtime setup, scaling, monitoring, cost controls, deployment pipeline | Containers, CI/CD, monitoring/logging stack |

Note: In smaller engagements, Frontend/Backend/DevOps can be partially combined into 2 strong full-stack engineers, with increased delivery risk and timeline variability.

---

## 6) Implementation Cost Estimate (Delivery)

### Cost by blended hourly rate
| Scenario | Person-hours | Hourly rate | Estimated cost |
|---|---:|---:|---:|
| Lower range | 424 | EUR 56.25 | EUR 23,850 |
| Base range | 520 | EUR 68.75 | EUR 35,750 |
| Upper range | 616 | EUR 87.50 | EUR 53,900 |

### Budget guidance
- Recommended planning envelope: EUR 35k-EUR 55k
- Final estimate should be re-baselined after a 1-week discovery sprint and integration workshop

---

## 7) Backend Hosting and Operations Cost (Monthly)

These ranges assume managed cloud services and moderate production usage.

| Cost item | Typical monthly range |
|---|---:|
| API runtime (container/app service) | EUR 80-400 |
| Load balancing/network egress | EUR 30-250 |
| Managed database/cache (if used) | EUR 40-250 |
| Secrets/config and observability | EUR 20-180 |
| Object storage/artifacts/log retention | EUR 10-120 |
| AI inference usage (driver) | EUR 300-4,000+ |
| **Total monthly backend + AI** | **EUR 480-5,200+** |

Notes:
- AI inference cost is typically the largest variable (image count, resolution, retries, concurrency)
- Set spending alerts, quotas, and per-request telemetry from day 1

---

## 8) Milestone Plan
| Milestone | Target window | Outcome |
|---|---|---|
| M1 | Week 1-2 | Discovery, UX flows, technical design, backlog finalization |
| M2 | Week 3-5 | Frontend module implementation + backend hardening |
| M3 | Week 6-7 | Integration with client storefront + end-to-end testing |
| M4 | Week 8+ | UAT, fixes, release preparation, handover |

For larger UAT rounds or additional compliance/security gates, extend to Week 9-12.

---

## 9) Risks and Estimate Drivers
- Unknown constraints in client storefront integration points
- Browser/device camera behavior differences and permissions UX
- Latency/timeout behavior under real traffic
- Security/compliance requirements discovered late
- AI usage volume and output quality thresholds

---

## 10) Recommended Next Step
Run a 5-day discovery sprint to lock:
- Final UX and acceptance criteria
- Integration contract with the storefront team
- Non-functional requirements (performance, availability, observability)
- Updated estimate with reduced uncertainty (+/-15%)

