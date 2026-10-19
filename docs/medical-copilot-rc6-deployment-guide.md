# Medical Copilot RC6 — Deployment Guide

> RC6 **no ejecuta deploy**. Esta guía es referencia para promoción futura post-QA clínica.

## Preconditions

1. Branch `release/medical-copilot-v1.0-rc2` certificada (RC6 checklist `pass: true`)
2. Backend + Frontend gates PASS
3. Playwright crítico PASS
4. Contract drift baseline intacta
5. Feature flag / kill-switch plan documentado
6. Aprobación humana de promoción (fuera de este documento)

## Environments (conceptual)

| Env | Uso |
|---|---|
| Local | format/lint/build/test + Playwright |
| Staging | QA clínica (post-RC6) |
| Production | Solo tras checklist de promoción firmada |

## Backend

- NestJS app; Medical Copilot bajo `/api/medical-copilot`
- Requiere JWT, RBAC (DOCTOR/ADMIN), CSRF en mutaciones
- Env: `MEDICAL_COPILOT_ENABLED` y flags de feature existentes

## Frontend

- Next.js; flag `NEXT_PUBLIC_MEDICAL_COPILOT=1` (y flags de workspace según entorno)
- No desplegar desde RC6 checklist sola

## Explicit

**NO deploy from RC6.** Merge a `main` no forma parte de RC6.
