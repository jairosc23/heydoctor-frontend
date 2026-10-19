# Medical Copilot RC6 — Security Review (Read-Only)

> Branch: `release/medical-copilot-v1.0-rc2`  
> **No code was modified** for this review. Certification of existing controls only.

## Matrix

| Área | Estado | Notas |
|---|---|---|
| HITL | Present | Seals `requiresPhysicianReview`, approve/reject sin execute automático |
| Persistence | Present | Módulo governed + execution paths internos |
| EMR / connectors | Partial | Connectors TypeORM internos HeyDoctor; sin FHIR/Epic externo |
| Audit | Partial | AuditService en acciones/AI runs/persistencia; opcional en algunos servicios |
| Transactions / rollback | Partial | TX real en consultation connector; contratos stub en infra |
| Authorization / JWT / RBAC | Present | JwtAuthGuard + RolesGuard + FeatureGuard; ownership de sesión |
| Session validation | Present | `assertSessionAccess` / consultation ownership |
| CSRF | Present | APP_GUARD global; FE inyecta `X-CSRF-Token` en mutaciones |
| Kill-switch | Present | `MEDICAL_COPILOT_ENABLED` / runtime status |

## Key references (backend)

- `src/ai/medical-copilot-facade.controller.ts` — guards + throttle
- `src/ai/governed-clinical-persistence/governed-approval-gate.ts`
- `src/ai/governed-clinical-persistence/governed-consultation-persistence-execution.service.ts`
- `src/common/csrf/csrf.guard.ts`
- `src/ai/medical-copilot-application.service.ts` — approve/reject + audit

## Key references (frontend)

- `lib/heydoctor-api.ts` / `lib/api-csrf.ts` — CSRF en mutaciones
- Paneles governed READ ONLY con banners HITL / NO EMR

## Certification posture for RC6

RC6 **documenta** controles existentes. No remedia ni refactoriza. Riesgos conocidos (doble verdad infra vs execution, audit opcional, ausencia EMR externo) quedan registrados para QA clínica / post-RC; **fuera de alcance de freeze**.

## Declaration

Security review = lectura. Sin cambios de comportamiento. SSOT no ampliado.
