# ADR-019: Clinical Workspace Observability Contract

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-04 |
| **Authors** | Architecture / Product |
| **Reviewers** | SAVAC-HeyDoctor |
| **Phase / initiative** | Fase 19 · T4, S1, T2 |
| **Related** | [`ENTERPRISE_OPERATIONAL_RELEASE_RUNBOOK.md`](../../ENTERPRISE_OPERATIONAL_RELEASE_RUNBOOK.md), [`PHASE_4.9.4_GO_LIVE_OPERATIONAL_EXECUTION.md`](../../PHASE_4.9.4_GO_LIVE_OPERATIONAL_EXECUTION.md), `e2e/clinical-p0.spec.ts` |

---

## Context

HeyDoctor usa dos feature flags compile-time para el encounter clínico:

- `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE`
- `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE`

La validación GO-LIVE (gl-01..gl-18) y la suite E2E P0 dependen de atributos DOM (`data-*`) para verificar flags en Preview/CI.

Tras consolidaciones 4.8.x, el layout runtime en `ConsultationWorkspace.tsx` (generación B) divergió de la documentación ops escrita para `EncounterSplitLayout.tsx` (generación A). Discrepancias detectadas:

| Artefacto | Expectativa | Runtime (pre-19.1) |
|---|---|---|
| Runbook / gl-03 | `data-columns="2"` | `data-columns="1"` |
| E2E P0-1 | `data-columns="1"` | Alineado |
| E2E P0-3 / gl-04 | `data-smart-workspace="true"` | Atributo ausente en TSX |
| `EncounterSplitLayout.tsx` | `data-columns` 2/3 | No importado (huérfano) |

Sin contrato único, S1/T2 producirían FAIL sistemáticos o evidencia inconsistente.

## Decision

### D1 — SSOT del contrato

1. **Comportamiento:** `ConsultationWorkspace.tsx` + wiring en `app/panel/consultas/[id]/page.tsx`.
2. **Observabilidad:** este ADR-019.
3. **E2E, audits, runbook, GO-LIVE:** deben converger a ADR-019; no pueden contradecirlo.

### D2 — Contrato oficial de atributos (Action WS ON + Smart WS ON)

| Selector / atributo | Condición | Valor | GO-LIVE |
|---|---|---|---|
| `[data-testid="encounter-split-layout"]` | Desktop xl+, consulta con paciente | visible | gl-03 |
| `data-clinical-action-workspace` | `isClinicalActionWorkspaceEnabled()` | `"true"` | gl-03, gl-05 |
| `data-columns` | Action WS ON (generación B) | `"1"` | gl-03 |
| `data-smart-workspace` | `isSmartClinicalWorkspaceEnabled()` en shell SOAP | `"true"` | gl-04 |
| `[data-testid="clinical-action-bar"]` | Action WS ON + patientId | visible | gl-05 |
| `[data-testid="clinical-context-panels"]` | Desktop xl+ | visible | P0-1 |
| `[data-testid="clinical-navigation-rail"]` | Desktop xl+ | visible | P0-0 |
| `[data-testid="clinical-encounter-chart"]` | Encounter chart montado | visible | P0-1 |

### D3 — Semántica de `data-columns`

| Valor | Significado | Estado |
|---|---|---|
| `"1"` | Workstation generación B: columna clínica unificada (context panels + SOAP); nav rail excluido del conteo; órdenes en panel colapsable inferior | **Oficial — Action WS ON** |
| `"2"` | Grid generación A: rail paciente + SOAP sin panel derecho | **Obsoleto** |
| `"3"` | Grid generación A: rail + SOAP + panel derecho legacy | **Obsoleto** |

**gl-03 redefinido:** PASS si `data-clinical-action-workspace="true"` **y** `data-columns="1"` **y** componentes visuales obligatorios del runbook §5.8 presentes.

**v-no-3col:** PASS si `data-columns` ≠ `"3"` (sigue vigente).

El término visual «layout 2-col» en runbooks describe nav rail + columna clínica simultáneos; **no** implica `data-columns="2"`.

### D4 — `data-smart-workspace`

- Parte del contrato cuando Smart WS está ON.
- Se emite en el **shell SOAP** (contenedor de `ClinicalSurface` con clase `soap-command-center-shell`).
- Implementación en Subfase 19.1; sin cambio de layout visual.

### D5 — `EncounterSplitLayout.tsx`

- Clasificado como **obsoleto (generación A)**.
- No se elimina en Fase 19.1.
- Eliminación permitida en fase posterior de legacy retirement, tras actualizar rollback docs y audit tests.

### D6 — Documentos derivados (sincronizar en 19.1)

| Documento / artefacto | Cambio |
|---|---|
| `ENTERPRISE_OPERATIONAL_RELEASE_RUNBOOK.md` §5.8 | `data-columns="1"` + nota semántica |
| `PHASE_4.9.4`, `PHASE_4.9.2`, `PHASE_4.9.1` | gl-03 / v-layout-2col |
| `lib/go-live-preparation-audit.ts` | `VISUAL_VALIDATIONS.v-layout-2col` |
| `lib/staging-activation-runtime-e2e-audit.ts` | Pasos DevTools |
| `docs/architecture/frontend-roadmap.md` T4 | Validar `"1"` + smart WS |
| `PHASE_4.9.5` rollback §1 | Flags OFF ya no restauran `EncounterSplitLayout` en runtime |

### D7 — Jerarquía en conflicto

```
Runtime (L1) → ADR-019 (L2) → SSOT doc (L3) → E2E / audits (L4) → Runbook (L5) → Phase docs históricos (L6)
```

## Alternatives considered

| Alternative | Pros | Cons | Rejection reason |
|---|---|---|---|
| Adoptar `data-columns="2"` en código | Alinea runbook legacy sin editar docs | Contradice runtime generación B y E2E P0-1 ya actualizado | Código es SSOT de comportamiento |
| Reintroducir `EncounterSplitLayout` | Restaura docs 4.9.x tal cual | Regresión de layout 4.8.x; viola cambio mínimo | Generación B es la experiencia auditada 4.7–4.8.4 |
| Eliminar atributos `data-*` | Simplicidad DOM | Pierde verificación GO-LIVE automatizable | Requisito ops P0 |

## Consequences

### Positive

- Contrato único para Fase 19.1+.
- gl-03 deja de fallar por expectativa `"2"` obsoleta.
- E2E P0-1 y runtime alineados por diseño.

### Negative / debt

- Docs ops pre-19.1 quedaron desactualizados hasta sincronización.
- Rollback documentado en 4.9.5 es impreciso respecto a `EncounterSplitLayout`.
- `data-columns` con Action WS OFF sigue emitiendo `"1"` — deuda menor para fase cleanup.

### Risks mitigated

- FAIL sistemático en S1/T2 por contrato contradictorio.
- Regresiones silenciosas por E2E parcialmente alineado.

## Compliance and verification

- `e2e/clinical-p0.spec.ts` P0-1, P0-3 y smoke layout validan contrato ADR-019.
- `lib/go-live-preparation-audit.ts` y `lib/staging-activation-runtime-e2e-audit.ts` reflejan mismos selectores/valores.
- gl-03 / gl-04 verificables en DevTools Preview con flags ON.

## References

- Fase 19.0 — Architecture Contract Validation
- `app/panel/consultas/[id]/_components/ConsultationWorkspace.tsx`
- `app/panel/consultas/[id]/_components/EncounterSplitLayout.tsx` (generación A, obsoleto)
- [`000-adr-policy.md`](./000-adr-policy.md)

---

## Revision history

| Date | Change | Author |
|---|---|---|
| 2026-07-04 | Creation — accepted post Fase 19.0 | Architecture |
