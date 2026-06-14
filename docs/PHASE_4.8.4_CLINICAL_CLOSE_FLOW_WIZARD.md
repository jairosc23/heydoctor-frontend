# Phase 4.8.4 — Clinical Close Flow Wizard™

**Objetivo:** Guía visual del cierre clínico sin nuevas reglas, backend ni bloqueos.

**Base:** Frontend `6dd4e2cd` (4.8.3D) · Backend `c10e284` (sin cambios)

---

## Flujo antes / después

### Antes

Estados dispersos: Completada ≠ Firmada ≠ Entregada ≠ Pagada. Acciones en cabecera, menú ⋯ y paneles sin checklist unificado.

### Después

**Clinical Close Flow™** visible bajo el chrome del encounter:

```
[1 Documentar] → [2 Revisar] → [3 Firmar] → [4 Entregar]
```

Checklist con ✓ / ⚠ / ○ — informativo, no bloqueante.

---

## Componentes creados

| Archivo | Rol |
|---------|-----|
| `lib/clinical-close-flow.ts` | Lógica pura del wizard |
| `lib/clinical-close-flow-audit.ts` | Auditoría estados reutilizados/faltantes |
| `app/panel/consultas/[id]/_components/ClinicalCloseFlow.tsx` | UI integrada en `[id]` |

---

## Estados reutilizados

- `consultation.status` (draft → locked)
- `isSigned`, `isLocked`, `canPay` (page.tsx)
- `buildClinicalCopilotIntelligence` → gaps + quality
- `useConsultationAutosave` → autosaveStatus
- SOAP fields (motivo, notas, dx, plan)
- `pendingLabs` desde memoria clínica (hint órdenes)

---

## Estados faltantes (documentados)

| Estado | Impacto |
|--------|---------|
| PDF/receta generada | Proxy por firmada/bloqueada |
| Entrega confirmada | Orienta a «Compartir consulta» |
| Conteo órdenes API | Proxy treatment + status |
| Pago intermedio | canPay ambiguo (audit 4.8.1) |

---

## Riesgos

1. Quality Score nunca bloquea firma.
2. Gaps Copilot ≠ criterio individual del médico.
3. Órdenes no verificadas por API.

---

## NO implementado

E2E, analytics, agents, nuevos endpoints, cambios firma/pago/documentos.
