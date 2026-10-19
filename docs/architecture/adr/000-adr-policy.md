# ADR-000: ADR Policy

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-04 |
| **Authors** | Architecture / Product |
| **Reviewers** | SAVAC-HeyDoctor |
| **Phase / initiative** | Fase 19 · D7 (ADR / decision log) |
| **Related** | [`frontend-roadmap.md`](../frontend-roadmap.md), [`FRONTEND_SSOT.md`](../../FRONTEND_SSOT.md) |

---

## Context

HeyDoctor Frontend acumula decisiones arquitectónicas en documentos de fase (`PHASE_*`), runbooks operacionales, audits machine-readable y contratos SSOT (`branding-ssot.md`). No existía un registro único, numerado e inmutable de **decisiones** con contexto y alternativas descartadas.

La Fase 19.0 detectó ambigüedades entre código, E2E, runbook y audits (contrato `data-*` del Clinical Workspace). Se requiere una política permanente antes de versionar ADR-019 e implementar la Subfase 19.1.

## Decision

### D1 — Ubicación

Los ADR viven en:

```
docs/architecture/adr/
```

Directorio plano (sin subcarpetas por dominio). Índice en `docs/architecture/adr/README.md`.

### D2 — Numeración

- Formato: **ADR-NNN** (NNN = entero de 3 dígitos, secuencial global en el repo frontend).
- **ADR-000** = esta política.
- Los números **no se reutilizan** aunque el ADR quede obsoleto.
- No es obligatorio backfill de ADR-001..018 para decisiones históricas.

### D3 — Nombres de archivo

```
NNN-kebab-case-title-en-ingles.md
```

Ejemplo: `019-clinical-workspace-observability-contract.md`.

### D4 — Estados del ciclo de vida

| Estado | Significado |
|---|---|
| **Proposed** | Borrador en PR; aún no mergeado |
| **Accepted** | Mergeado a `main`; decisión vigente |
| **Deprecated** | Sustituida; conservar por historial |
| **Superseded by ADR-NNN** | Reemplazada explícitamente |

Solo **Accepted** en `main` es decisión oficial.

### D5 — Plantilla

Usar `docs/architecture/adr/_template.md` para nuevos ADR. Título H1 y filename en inglés; cuerpo en español (convención del proyecto).

### D6 — Cuándo crear un ADR

Crear ADR cuando la decisión es arquitectónica, afecta múltiples componentes o documentos, es difícil de revertir, o congela/redefine un contrato (observabilidad, SSOT, seguridad transversal).

No crear ADR para informes de cierre de fase (`PHASE_*`), procedimientos operativos repetibles (runbooks), entradas del roadmap sin decisión nueva, o fixes puntuales sin impacto arquitectónico.

### D7 — Commits

Conventional Commits:

```
docs(adr): add ADR-NNN short description
docs(adr): supersede ADR-012 with ADR-025
```

### D8 — Jerarquía en conflicto

```
Runtime (L1) → ADR Accepted (L2) → SSOT doc (L3) → E2E / audits (L4) → Runbook / GO-LIVE (L5) → Phase docs históricos (L6)
```

Si SSOT y ADR divergen: nuevo ADR que supersede + actualización SSOT en fase dedicada.

## Alternatives considered

| Alternative | Pros | Cons | Rejection reason |
|---|---|---|---|
| ADR en raíz `docs/adr/` | Separación visible | Rompe agrupación `architecture/` ya iniciada | Menor coherencia con SSOT y roadmap |
| ADR por dominio en subcarpetas | Organización temática | Complejidad de índice; over-engineering para escala actual | Política exige directorio plano |
| Solo phase docs, sin ADR | Menos archivos | Decisiones enterradas en informes de entrega | No resuelve ambigüedad 19.0 |

## Consequences

### Positive

- Trazabilidad de decisiones arquitectónicas.
- Base para sincronizar E2E, audits y runbooks.
- Flujo claro: Roadmap → ADR → SSOT → ops.

### Negative / debt

- Mantener índice `adr/README.md` actualizado en cada ADR nuevo.
- ADR retrospectivos (Branding, CSP) opcionales — deuda documental menor.

### Risks mitigated

- Contradicciones silenciosas entre código y documentación ops.
- PRs de implementación sin referencia de decisión.

## Compliance and verification

- Cada PR que introduce decisión arquitectónica referencia ADR en descripción o commit.
- Índice `adr/README.md` lista todos los ADR Accepted.
- Implementación referencia ADR con `Implements ADR-NNN` cuando aplica.

## References

- [`frontend-roadmap.md`](../frontend-roadmap.md) — iniciativas D3, D7
- [`_template.md`](./_template.md) — plantilla estándar
- Fase 19.0 — Architecture Contract Validation

---

## Revision history

| Date | Change | Author |
|---|---|---|
| 2026-07-04 | Creation — policy accepted | Architecture |
