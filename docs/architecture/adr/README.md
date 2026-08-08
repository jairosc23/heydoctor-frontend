# Architectural Decision Records (ADR)

Índice oficial de decisiones arquitectónicas del frontend HeyDoctor.

**Política:** [ADR-000](./000-adr-policy.md)  
**Plantilla:** [`_template.md`](./_template.md)

---

## Índice

| ADR | Título | Estado | Fecha | Fase / iniciativa |
|---|---|---|---|---|
| [ADR-000](./000-adr-policy.md) | ADR Policy | Accepted | 2026-07-04 | Fase 19 · D7 |
| [ADR-019](./019-clinical-workspace-observability-contract.md) | Clinical Workspace Observability Contract | Accepted | 2026-07-04 | Fase 19 · T4, S1, T2 |
| [ADR-020](./020-medication-domain.md) | Medication Domain | Proposed | 2026-08-08 | Enterprise Prescription Builder |

---

## Referencias relacionadas

| Documento | Relación |
|---|---|
| [`../frontend-roadmap.md`](../frontend-roadmap.md) | Inventario estratégico; referencia ADR por iniciativa |
| [`../branding-ssot.md`](../branding-ssot.md) | Contrato SSOT Branding (Fase 18) |
| [`../../FRONTEND_SSOT.md`](../../FRONTEND_SSOT.md) | Política repositorio SSOT |

---

## Crear un nuevo ADR

1. Copiar `_template.md` → `NNN-kebab-case-title.md` (siguiente número disponible).
2. Completar secciones; estado inicial **Proposed** en PR.
3. Tras merge a `main`, estado **Accepted** y actualizar esta tabla.
4. Commit: `docs(adr): add ADR-NNN short description`.
