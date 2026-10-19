# Medical Copilot RC4 — Production Hardening

> Branch: `release/medical-copilot-v1.0-rc2`
> SSOT Enterprise: **frozen** (no new engines/workflows/endpoints)

## Objectives

Operational stabilization on top of RC3:

1. Request cache hardening (TTL, eviction, leak protection, hit ratio)
2. Frontend virtualization (viewport + lazy)
3. Internal performance observability
4. Contract integrity tests
5. Error isolation for enterprise orchestration
6. Documentation + operational audit

## SSOT (unchanged)

- AI-1…95, Fases 2…88
- Persistence / Suggestions / Evidence / Functional / Specialized / Rules / Pipeline
- Knowledge / Evidence Engine / Guidelines / Decision / Calculation
- Longitudinal / Therapeutic / Diagnostic / Population
- Clinical AI Orchestrator Enterprise
- Enterprise Clinical Workflow Engine
- RC3 Operational Layer

## Namespaces

| Layer | Namespace |
|---|---|
| Operational RC3 | `src/ai/rc3-operational`, `lib/medical-copilot/rc3-operational` |
| Operational RC4 | `src/ai/rc4-operational`, `lib/medical-copilot/rc4-operational` |
| Packages | `governed-*-enterprise`, `governed-*-intelligence` |
| Orchestrator | `governed-clinical-ai-orchestrator-*` |
| Workflows | `governed-clinical-*-workflow` |

## Performance Layer

### Backend

- `memoInRequest` / `memoInRequestSync` with TTL (`RC4_REQUEST_MEMO_TTL_MS`), max entries, rejected-promise eviction
- Metrics: hit ratio, fan-out, histogram, payload avg/max
- `Rc4OperationalInterceptor` logs + clears memo maps end-of-request

### Frontend

- `MedicalCopilotDeferredPanel` virtualizes off-screen closed panels
- Package cache TTL (`RC4_PACKAGE_CACHE_TTL_MS`)
- FE samples: render / lazy / package hydration durations

## Operational Layer

- Error isolation via `Promise.allSettled` + empty typed carriers
- Contract integrity specs for enterprise / orchestrator / workflow / persistence modules
- Auto audit JSON: `docs/medical-copilot-rc4-operational-audit.json`

## Compatibility

- No new governed endpoints
- No contract renames
- HITL seals unchanged
- UI remains `<details>` accordion (same visual pattern)
