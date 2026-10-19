# Medical Copilot RC6 — Production Certification

> Branch: `release/medical-copilot-v1.0-rc2`  
> Focus: **Release Candidate Freeze** — certificación definitiva, sin ampliación de SSOT  
> Deploy: **NO** · Merge a main: **NO**

## Certification Statement

RC6 certifica la plataforma Medical Copilot previa a QA clínica y promoción a producción.

- SSOT enterprise: **CONGELADO**
- Código clínico governed: **sin cambios de comportamiento en RC6**
- Alcance RC6: auditoría, inventario, arquitectura, seguridad (lectura), documentación, validación de gates
- Capas operacionales previas: RC3 (memo), RC4 (isolation/TTL), RC5 (resilience/observability/drift) — **certificadas, no extendidas**

## Document Map

| Documento | Propósito |
|---|---|
| `medical-copilot-rc6-architecture.md` | Mapa de arquitectura y bounded contexts |
| `medical-copilot-rc6-inventory.json` | Inventario de producción |
| `medical-copilot-rc6-repo-audit.json` | Auditoría de repositorio |
| `medical-copilot-rc6-security-review.md` | Revisión de seguridad (solo lectura) |
| `medical-copilot-rc6-deployment-guide.md` | Guía de despliegue (referencia; RC6 no despliega) |
| `medical-copilot-rc6-operational-guide.md` | Operación |
| `medical-copilot-rc6-recovery-guide.md` | Recuperación |
| `medical-copilot-rc6-release-guide.md` | Release / promoción |
| `medical-copilot-rc6-maintenance-guide.md` | Mantenimiento |
| `medical-copilot-rc6-developer-guide.md` | Desarrolladores |
| `medical-copilot-rc6-certification-checklist.json` | Checklist final de producción |

## Prior RC lineage

| RC | Tema |
|---|---|
| RC3 | Operational readiness (request memo, package-first FE) |
| RC4 | Production hardening (isolation, TTL, virtualization) |
| RC5 | Production readiness (resilience, percentiles, drift, diagnostics) |
| **RC6** | **Production certification / freeze** |

## Explicit non-goals

RC6 **no** crea engines, workflows, packages, endpoints, builders, orchestrators, aggregators, panels, módulos governed ni inteligencia clínica nueva.
