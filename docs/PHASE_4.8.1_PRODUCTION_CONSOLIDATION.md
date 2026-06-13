# Phase 4.8.1 — Production Consolidation™

## Objetivo

Resolver hallazgos críticos de Phase 4.8 **sin nuevas funcionalidades** — solo auditoría, propuestas y roadmaps de consolidación.

**Base:** Frontend `7e36d8bd` · Backend `c10e284` (sin cambios)

**Veredicto Phase 4.8:** Listo con observaciones

---

## Pregunta central

> ¿Qué debemos simplificar o consolidar para que HeyDoctor sea más rápido y más seguro para un médico real durante una jornada completa?

**Respuesta:** Reducir **entry points IA** (7→2), **deduplicar chrome clínico** (alergias/condiciones/medicación en 4–5 superficies), **guiar cierre de consulta**, **fijar layout prod** (flags workspace), **E2E P0** antes de declarar estabilidad, y **retirar rutas legacy** (`/panel/consultas` inline).

---

## 1. Principales duplicaciones detectadas

| Dominio | Superficies | Severidad |
|---------|-------------|-----------|
| Condiciones activas | Snapshot, Memory, Timeline, Copilot Context | **Alta** |
| Alergias | SafetyStrip, Snapshot, Memory, Rail profile | **Alta** |
| Alertas clínicas | SafetyStrip, Snapshot, Timeline Alerts, Copilot Risk | **Alta** |
| Medicación | Memory, Timeline, Plan, Orders, Copilot Context | **Alta** |
| Demografía | Snapshot, Context Rail, Copilot Context | Media |
| Labs pendientes | Memory, Timeline, Copilot insight | Media |
| Longitudinal | Timeline, Copilot, Doctor DNA | Media |
| Calidad documental | Copilot Quality, Copilot Gaps, LiveAiNoteSuggestions | Media |
| IA generativa | Assist Panel, Insights Panel, LiveAiNotes, menú «Análisis IA» | **Alta** |

Mapa completo: `lib/production-consolidation-audit.ts` → `CLINICAL_DEDUPLICATION_MAP`

---

## 2. Principales fricciones detectadas

| Fricción | Evidencia | Impacto jornada |
|----------|-----------|-----------------|
| **7 entry points IA** | Header Copilot, tab Asistencia (3 paneles), menú ⋯, ActionBar chip, legacy page | Confusión, clics extra |
| **~25–30 superficies UI** por consulta | Tabs, drawers, sheets, sub-tabs, colapsables | Scroll, fatiga cognitiva |
| **Cierre multi-paso no guiado** | Completada / Firmada / Pagada en lugares distintos | Consultas firmadas incompletas |
| **Layout dependiente de flags** | Action WS + Smart WS **OFF** por defecto | Prod ≠ entorno auditado 4.7 |
| **Plan → órdenes salto contexto** | Sheet vs panel derecho; copy desactualizado | Interrupción post-aplicar plan |
| **Tab Asistencia mezcla IA + Chat** | ChatPanel junto a Assist + Insights | Curva aprendizaje |
| **Autosave vs Guardar ficha** | Riesgo P0 carrera en `notes` | Pérdida documentación |
| **Mobile 5 tabs + rail duplicado** | MobileConsultationWorkspace | Productividad móvil baja |
| **Documentos 6 entry points** | Header, menú, ActionBar, DocumentsTab, Orders | Clics redundantes |

---

## 3. Riesgos clínicos

- Firma legal **sin gate documental** (Copilot informa gaps pero no guía cierre).
- **Doble lectura** de alertas puede inducir complacencia o ignorar SafetyStrip.
- IA generativa en **3 paneles** con governance distinto → inconsistencia clínica percibida.
- **Teleconsulta fullscreen** sin SOAP → documentación diferida post-llamada.
- Polifarmacia en Copilot **sin interacciones** — riesgo de falsa seguridad (by design, documentar).
- Flags OFF en prod → médico opera layout **sin Smart WS** (más scroll, menos densidad clínica).

---

## 4. Riesgos UX

- Fatiga visual por chips/badges repetidos (Snapshot + SafetyStrip + Memory).
- Copilot drawer **sin ranking CRÍTICO→INFORMATIVO** en UI (diseñado 4.7, no implementado).
- Doctor DNA compite con Copilot en header por atención analítica.
- Action Workspace OFF → panel derecho fijo; ON → sheet repetitivo — **ninguno optimizado sin flags prod**.
- Lista `/panel/consultas` con UI legacy inline si redirect falla.

---

## 5. Riesgos operacionales

- **Sin E2E** flujo consulta (pendiente P0 mar 2026).
- **Flags prod no verificados** (Railway MCP no autenticado en 4.8.1).
- `PatientBanner.tsx` **sin imports** — código muerto.
- `page.tsx` ~1176 líneas — regresiones silenciosas.
- Factura dual legacy expuesta.
- Checklist manual P0 **sin evidencia de cierre**.

---

## 6. Recomendación de simplificación

### IA — una experiencia coherente

| Componente | Decisión |
|------------|----------|
| **Clinical Copilot™** | **Mantener** — hub canónico (determinístico 4.7D) |
| **LiveAiNoteSuggestions™** | **Mantener** — inline en Notas SOAP (momento escritura) |
| **Consultation Assist™** | **Consolidar** → dentro Copilot (opt-in generativo) |
| **AI Insights Panel™** | **Deprecar** panel independiente; unificar API con LiveAiNotes |
| **ChatPanel** | **Reubicar** fuera de tab Asistencia |
| **Entry points duplicados** | **Eliminar** menú ⋯ «Análisis IA» + chip ActionBar |

### Chrome clínico — una capa de riesgo

- **SafetyStrip** = única fuente alergias/alertas críticas en chrome.
- **Clinical Memory** = condiciones, medicación, labs (rail canónico).
- **PatientSnapshot** = identidad + estado consulta solamente (xl+ compact).
- **Copilot** = inteligencia accionable; **no** re-listar Memory/Timeline en Context Engine.

### Cierre — flujo único (diseño, no implementado)

Ver `CONSULTATION_CLOSE_FLOW_RECOMMENDED` en audit lib:

1. Documentar → 2. Finalizar → 3. Firmar → 4. Entregar (docs + pago)

Barra progreso en header; eliminar «Marcar completada» del menú oculto.

---

## 7. Roadmap de consolidación

| Fase | Nombre | Alcance |
|------|--------|---------|
| **4.8.2** | IA Unification | Deprecar tab Asistencia; 2 entry points |
| **4.8.3** | Clinical Chrome Dedup | SafetyStrip + Memory canónicos |
| **4.8.4** | Close Flow Wizard | Implementar diseño cierre |
| **4.8.5** | Workspace Flags Prod | ON staging→prod; retirar 3-col |
| **4.8.6** | E2E P0 Suite | 4 casos críticos Playwright |
| **4.8.7** | Legacy Retirement | `/panel/consultas` inline, PatientBanner, mock |

**Principio:** consolidar antes de Agents, Analytics o nuevas Clinical Apps.

---

## 8. Roadmap E2E

| Sprint | Casos | Tooling |
|--------|-------|---------|
| 1 | HTA follow-up, Ficha+autosave | Playwright |
| 2 | Orders lab, Payment lock | Playwright + Payku mock |
| 3 | Cefalea aguda, Documents, Mobile tabs | Playwright |

Especificación completa: `E2E_MINIMUM_SPEC` (7 casos, 4 P0).

---

## Prioridades 4.8.1 — cumplimiento

| Prioridad | Entregable | Estado |
|-----------|------------|--------|
| P1 IA unificada | Propuesta + audit componentes | ✅ |
| P2 Deduplicación | Mapa 11 dominios | ✅ |
| P3 Close Flow | Audit + diseño recomendado | ✅ (no implementado) |
| P4 Action WS | Validación flags + matriz layouts | ✅ (prod manual pendiente) |
| P5 E2E | Especificación 7 casos | ✅ (no tests) |
| P6 Legacy | Inventario 9 ítems + plan retiro | ✅ (no eliminación) |

---

## Archivos de auditoría

| Archivo | Rol |
|---------|-----|
| `lib/production-consolidation-audit.ts` | Mapas, propuestas, roadmaps |
| `lib/production-consolidation-audit.test.ts` | Validación estructura audit |
| `docs/PHASE_4.8.1_PRODUCTION_CONSOLIDATION.md` | Informe ejecutivo |

**Sin cambios:** motor clínico, Copilot intelligence, UI encounter, backend.

---

## Validación

```bash
npm run typecheck   # PASS
npm test            # PASS (incluye production-consolidation-audit)
npm run build       # PASS
```

---

## Estado final del producto

| Dimensión | Evaluación post-4.8.1 |
|-----------|------------------------|
| Uso clínico diario | **Listo con observaciones** (sin cambio vs 4.8) |
| Plan consolidación | **Definido** — 6 sub-fases 4.8.2–4.8.7 |
| Complejidad IA | **Auditada** — consolidación pendiente |
| Prod layout | **Incógnita** — verificar flags en Vercel/Railway |
| Confianza operativa | **Pendiente E2E P0** |

**No iniciar:** Agents, Analytics, nuevas Clinical Apps, nuevos módulos IA.
