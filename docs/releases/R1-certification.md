# R1 Certification

**Type:** registro de certificación (no diseño, no implementación)  
**Program:** Release Phase · RELEASE 1.0 · R1 Artefacto  
**Source:** `docs/RELEASE_1_PRODUCTION_PLAN.md` · `docs/RELEASE_R1_LTS_ARTIFACT_DESIGN.md`  
**Date:** 2026-08-28

R1 queda **CERRADO**. Este documento no modifica producto, arquitectura, RBAC, pipeline ni dataset.

---

## SHA certificado

| Campo | Valor |
|-------|--------|
| Repo | `jairosc23/heydoctor-frontend` |
| Rama de certificación | `feat/phase-19a-clinical-workspace-closure` |
| **SHA-FE-LTS** | `db4bdbf379b7e891dccbb36b30b0255d8523fb9d` |
| Commit | `fix(e2e): use the official encounter pay trigger in P0-4` |
| `main` | fast-forward a SHA-FE-LTS |
| Tag anotado | `v1.0.0-lts` |
| Tag object | `f0e11acae6deb9da8890900610bc84cb36484568` |
| Tag → commit | `db4bdbf379b7e891dccbb36b30b0255d8523fb9d` |
| SHA-BE al cierre | `bc3db18ca87be0172a6c0eee700333f0e6b44afe` (`heydoctor-backend-pro-1` `origin/main`) |

---

## Workflow certificado

| Campo | Valor |
|-------|--------|
| Workflow | `CI` |
| Trigger | `workflow_dispatch` |
| Run | [33224895758](https://github.com/jairosc23/heydoctor-frontend/actions/runs/33224895758) |
| Head SHA | `db4bdbf379b7e891dccbb36b30b0255d8523fb9d` |
| Conclusión | `success` |

| Job | Resultado |
|------|-----------|
| quality | PASS |
| resolve-preview | PASS |
| e2e-f2-01 | PASS |
| e2e-p0 | PASS |
| frontend | PASS |

---

## Dataset oficial

Ver `docs/testing/e2e-dataset.md`. Secrets de consulta usados en el run certificado:

| Secret | UUID |
|--------|------|
| `E2E_CONSULTATION_HTA` | `3223d8a1-ec78-4945-9110-c2cd9e6e579a` |
| `E2E_CONSULTATION_DM2` | `63066cad-fd40-4dba-bc7c-33ff99c6ae3e` |
| `E2E_CONSULTATION_ACUTE` | `67d331e9-9649-4b30-9cdb-50bfb1b77e58` |
| `E2E_CONSULTATION_PAYMENT` | `f18e5767-65e9-4c6d-990e-747938756f18` |

Médico E2E: `e2e.ci.doctor@heydoctor.local`  
Paciente E2E: `E2E Paciente Seed`

---

## Criterios de aceptación (R1 PASS)

Fuente: `docs/RELEASE_1_PRODUCTION_PLAN.md` § Release R1.

1. El árbol LTS certificado está en git (`lib/clinical-completion`, settlement, operations, continuity, product-platform, digital-clinic, rutas `/panel/*` LTS).
2. Esas rutas están en **SHA-FE-LTS** en `main`.
3. Tag `v1.0.0-lts` apunta a SHA-FE-LTS.
4. CI L1 (`quality`) verde en ese SHA.
5. Aggregate `frontend` verde; L2 `e2e-p0` y `e2e-f2-01` ejecutados (no skipped) con secrets presentes.
6. Cero cambios a baselines congeladas en el cierre operativo (FF + tag + push).

R1 Certification: **PASS**
