# Phase 4.8.5 — Workspace Production Standardization™

**Objetivo:** Auditar flags de workspace y definir experiencia oficial HeyDoctor — **sin implementar** retiro de flags, cambios UX ni activación env.

**Base:** Frontend `044e40d0` (4.8.4) · Backend `c10e284` (sin cambios)

---

## Pregunta central

**¿Puede HeyDoctor declarar Clinical Action Workspace™ + Smart Clinical Workspace™ como experiencia oficial y permanente?**

**Respuesta: SÍ**, condicionado a:

1. Verificar valores reales de env en Vercel/Railway (prod puede estar en layout legacy).
2. Activar **ambos** flags en staging y ejecutar checklist QA P0.
3. Comunicar cambio de layout antes de prod.
4. Completar E2E P0 (fase 4.8.6) antes de retirar rollback.
5. Backend sin cambios — flags 100% frontend.

---

## Inventario de flags

| Flag | Env | Default código | .env.example |
|------|-----|----------------|--------------|
| Clinical Action Workspace™ | `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE` | `false` | Comentado |
| Smart Clinical Workspace™ | `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE` | `false` | No documentado |

Evaluación **compile-time** en `page.tsx` (module-level). Cambio de flag = rebuild/redeploy.

---

## Matriz de layout (2×2)

| Action WS | Smart WS | Layout | Prod probable |
|---------|--------|--------|---------------|
| OFF | OFF | Legacy 3-col: Rail \| SOAP \| Orders+Docs | **Sí** |
| ON | OFF | 2-col + Module Sheet | No |
| OFF | ON | 3-col + SOAP compacto + scroll spy | No |
| ON | ON | **2-col compacto + sheet (auditado 4.7–4.8)** | No (hasta activar) |

---

## Mapa de dependencias (resumen)

### Clinical Action Workspace™

- `EncounterSplitLayout` — 2 vs 3 columnas
- `ConsultationWorkspace` — oculta `EncounterRightPane`
- `ClinicalActionBar` + `ClinicalModuleSheet` — hub módulos
- `page.tsx` — handlers `openClinicalModule` vs `setRightPaneTab`
- `EncounterHeader` — `hideModuleShortcuts`
- `PatientSnapshot` — modo compact

### Smart Clinical Workspace™

- `SoapSection` — focus layout, previews, barra compacta
- `SoapStickyNav` + `useSoapScrollSpy`
- `PatientContextRail` — memoria compact + timeline colapsado
- `globals.css` — `.soap-focus-layout`
- `MobileConsultationWorkspace` — sticky nav móvil

**Independientes** pero la propuesta oficial activa **ambos**.

---

## Rollback paths (solo con flags OFF)

1. Grid 3 columnas + `EncounterRightPane`
2. State `rightPaneTab` / `workspaceTab` / `ordersSubTab`
3. Atajos header Rx/Lab/Docs
4. SOAP expandido sin previews
5. Timeline paciente sin progressive disclosure

---

## Propuesta workspace oficial

**HeyDoctor Clinical Workstation™**

- Action WS **ON** + Smart WS **ON**
- Desktop: rail contexto + SOAP Command Center compacto + sheet lateral
- Chrome: `ClinicalActionBar` + `ClinicalCloseFlow` + Copilot hub único
- Mobile: tabs + Smart sticky nav

---

## Riesgos

### Activación permanente

| ID | Severidad | Riesgo |
|----|-----------|--------|
| prod-env-unknown | Alta | Prod puede seguir en legacy si env no seteado |
| layout-change-training | Media | Curva aprendizaje panel derecho → sheet |
| smart-only-mismatch | Media | Solo Smart ON deja panel derecho + copy inconsistente |
| compile-time-rollback | Media | Revert requiere redeploy |
| e2e-gap | Media | Sin E2E automatizado layout 2-col |

### Retiro de rollback

| ID | Severidad | Riesgo |
|----|-----------|--------|
| incident-revert | Alta | Sin flag OFF no hay rollback rápido |
| encounter-right-pane-deletion | Media | Paridad handlers sheet vs RightPane |
| partial-env-staging | Media | Staging ≠ prod invalida auditorías |

---

## Roadmap retiro flags (NO implementado)

| Fase | Acción |
|------|--------|
| **4.8.6** | E2E P0 + activar flags staging |
| **4.9.1** | Activar flags prod + smoke 24h |
| **4.9.2** | Hardcode defaults `true` (env override temporal) |
| **4.9.3** | Retirar `EncounterRightPane`, `LEGACY_GRID`, tab state |
| **4.9.4** | Eliminar flags y props `*WorkspaceEnabled` |

---

## Archivos de auditoría

| Archivo | Rol |
|---------|-----|
| `lib/workspace-production-standardization-audit.ts` | Inventario, dependencias, riesgos, roadmap |
| `lib/workspace-production-standardization-audit.test.ts` | Tests auditoría |
| `lib/production-consolidation-audit.ts` | Referencia cruzada 4.8.1 |

---

## NO implementado en 4.8.5

- Eliminar flags o código legacy
- Activar variables Railway/Vercel
- Modificar UX, IA, flujos clínicos o backend
- E2E automatizado
