# Phase 4.9.5 — Development Freeze™

**Objetivo:** Congelar desarrollo funcional hasta completar validación operacional GO-LIVE.

**Alcance:** Documentación únicamente — sin código · sin commits funcionales · sin cambios frontend/backend.

**Estado GO-LIVE previo:** NO GO (operacional) · 0 bloqueadores código abiertos (4.9.3)

---

## PARTE A — Release Candidate Audit

### Release Candidate Frontend

| Campo | Valor |
|-------|-------|
| **Repositorio** | `SAVAC-HeyDoctor/heydoctor-frontend` |
| **SHA completo** | `5eb09cef3a6a253a6f33ddab7e6217d679403bb3` |
| **SHA corto** | `5eb09cef` |
| **Mensaje commit** | `docs(audit): Phase 4.9.2 GO-Live preparation runbook` |
| **Rama candidata** | `main` |
| **Fases incluidas** | 4.8.5 → 4.9.2 (workspace audit, E2E spec, blockers F1–F4, runbook, GO-LIVE CHECK) |

**Criterio RC:** Último commit estable con gates clínicos resueltos (4.9.0), infra E2E lista (4.8.6/4.9.2) y sin features pendientes para activación workspace.

**Nota:** Documentos 4.9.3/4.9.4 son auditoría ops (sin cambios runtime). No alteran el RC técnico `5eb09cef` hasta que se promueva un commit explícito post-validación.

### Release Candidate Backend

| Campo | Valor |
|-------|-------|
| **Repositorio** | `SAVAC-HeyDoctor/heydoctor-backend-pro` |
| **SHA completo** | `c10e284577759d8b45c75130c23f2fe82f467490` |
| **SHA corto** | `c10e284` |
| **Mensaje commit** | `test(ai): Phase 4.5.4 real clinical validation backend mirror` |
| **Rama candidata** | `main` (o rama prod actual desplegada) |

**Criterio RC:** Sin cambios requeridos para Clinical Action Workspace™ + Smart Clinical Workspace™. API staging/prod compatible con frontend RC.

### Par RC congelado

```
Frontend RC: 5eb09cef3a6a253a6f33ddab7e6217d679403bb3
Backend RC:  c10e284577759d8b45c75130c23f2fe82f467490
```

**Regla freeze:** Ningún merge a `main` que altere `/panel/consultas`, flags workspace, gates clínicos o contratos API usados por E2E P0 hasta emisión GO/NO GO final (4.9.4 Parte D).

---

## PARTE B — Production Checkpoint

### Transición requerida: NO GO → GO

Solo tareas **operacionales** (sin desarrollo):

| # | Tarea | GO-LIVE CHECK | Evidencia requerida |
|---|-------|---------------|---------------------|
| 1 | Setear `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1` en Vercel **Preview** | gl-01 | Captura env vars |
| 2 | Setear `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1` en Vercel **Preview** | gl-01 | Captura env vars |
| 3 | Redeploy preview sin error build | gl-02 | Link deployment + log build |
| 4 | Validar layout 2-col + action workspace ON | gl-03, gl-05 | Captura DevTools `data-columns="2"` |
| 5 | Validar Smart SOAP compacto | gl-04 | Captura `data-smart-workspace="true"` |
| 6 | Validar legacy listado consultas bloqueado | gl-06 | Captura banner redirect |
| 7 | Crear `.env.e2e` con 7 variables | gl-07 | Checklist variables |
| 8 | Ejecutar `./e2e/run-e2e.sh` — P0-1 HTA PASS | gl-08 | Reporte Playwright + log |
| 9 | P0-2 DM2 PASS | gl-09 | Reporte + capturas |
| 10 | P0-3 Aguda PASS | gl-10 | Reporte + capturas |
| 11 | P0-4 Pago PASS (o skip Payku documentado con validación manual equivalente) | gl-11 | Reporte + capturas |
| 12 | Smoke: Clinical Copilot abre sin error | gl-12 | Captura + consola |
| 13 | Smoke: autosave "guardado/saved" | gl-13 | Captura |
| 14 | Smoke: payment gate (no pago en completed pre-firma) | gl-14 | Captura por estado |
| 15 | Smoke: signed docs gate (PDF disabled pre-firma) | gl-15 | Captura pre/post firma |
| 16 | Repetir gl-01/gl-02 en scope **Production** | gl-16 | Captura Vercel prod |
| 17 | Redeploy prod con flags ON | gl-17 | Link deployment |
| 18 | Monitoreo post-prod 24h sin incidentes Sentry críticos workspace | gl-18 | Link Sentry + resumen |

**Condición GO:** **18/18 PASS** registrados en `docs/PHASE_4.9.4_GO_LIVE_OPERATIONAL_EXECUTION.md`.

**Evidencia faltante hoy:** **18/18 ítems** — ninguna ejecutada con evidencia en sesión ops.

---

## PARTE C — Rollback Strategy

> Documentación únicamente. No ejecutar salvo incidente prod.

### 1. Volver a layout legacy (encounter 3-col + panel derecho)

**Método preferido (sin redeploy código):**

1. Vercel → Environment Variables (scope afectado: Preview o Production).
2. Eliminar o setear `0` / vacío:
   - `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE`
   - `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE`
3. Redeploy el deployment activo.

**Comportamiento esperado tras redeploy:**

| Flag | Layout |
|------|--------|
| Action OFF | `EncounterSplitLayout` → `LEGACY_GRID` (3 columnas) + `EncounterRightPane` |
| Smart OFF | SOAP expandido, sin scroll spy / sticky nav / previews compactos |
| Ambos OFF | Experiencia pre-4.2/4.3 completa |

**Tiempo estimado:** 5–15 min (redeploy Vercel).

**Limitación:** `/panel/consultas` listado tiene `LEGACY_INLINE_CONSULTATION_WORKSPACE=false` (4.9.0) — el rollback de layout aplica a `/panel/consultas/[id]`. Revertir inline list requeriría commit (fuera de rollback ops rápido).

### 2. Desactivar flags

| Variable | Acción rollback | Scope |
|----------|-----------------|-------|
| `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE` | Delete o `0` | Preview / Production según incidente |
| `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE` | Delete o `0` | Idem |

Flags son **compile-time** en Next.js — cambio env **requiere redeploy** para surtir efecto.

### 3. Revertir frontend

**Opción A — Rollback Vercel (recomendado, minutos):**

1. Deployments → deployment anterior a activación flags ON.
2. Promote to Production (o reassign alias preview).
3. Confirmar env vars OFF en ese deployment.

**Opción B — Git revert (horas, solo si A insuficiente):**

1. Identificar commit pre-workspace o RC anterior acordado.
2. `git revert` o deploy branch pinneada — **requiere descongelar freeze** y aprobación explícita.
3. RC actual congelado: `5eb09cef` — no revertir sin decisión producto.

**Opción C — Flags OFF en RC actual (preferida):**

Mantiene fixes F1–F4 (gates pago, autosave, documentos) activos mientras restaura layout legacy.

### 4. Revertir backend

**Estado:** Backend RC `c10e284` no cambió durante fases workspace 4.8.x–4.9.x.

| Escenario | Acción |
|-----------|--------|
| Incidente solo frontend/layout | **No revertir backend** |
| Incidente API clínica | Railway/hosting → redeploy imagen/commit pinneado anterior a `c10e284` |
| Rollback coordinado | Confirmar `NEXT_PUBLIC_HEYDOCTOR_API_URL` apunta al backend correcto post-rollback |

**Pin RC backend:** `c10e284577759d8b45c75130c23f2fe82f467490`

### Matriz rollback rápido

| Severidad | Acción | Frontend | Backend |
|-----------|--------|----------|---------|
| P2 layout UX | Flags OFF + redeploy | Sí | No |
| P1 gate clínico | Flags OFF + redeploy; evaluar hotfix | Sí | Solo si API |
| P0 prod down | Promote deploy previo + flags OFF | Sí | Evaluar pin |

---

## PARTE D — Post GO-Live Roadmap

Priorizado. **Sin implementar durante freeze.**

| Prioridad | Iniciativa | Objetivo | Prerequisito |
|-----------|-----------|----------|--------------|
| **1** | **Workspace retirement** | Retirar `EncounterRightPane`, `LEGACY_GRID`, tab state, paths rollback; hardcode flags ON | GO emitido + gl-18 PASS + 7d observabilidad estable |
| **2** | **E2E expansión** | P1 rollback matrix (Action=0/Smart=0); mobile suite; CI scheduled contra staging | gl-08..11 PASS en preview |
| **3** | **Optimizaciones UX** | F6 chiefComplaint autosave; F7 Close Flow órdenes API; pulido Module Sheet | Post-retirement o paralelo bajo riesgo bajo |
| **4** | **Analytics** | Eventos workspace adoption, funnel firma→pago, errores Copilot | Prod estable ≥2 sprints |
| **5** | **Agents** | Nuevos agentes clínicos / automatizaciones | Analytics baseline + producto |

### Desglose Prioridad 1 — Workspace retirement (fases sugeridas)

| Fase | Acción |
|------|--------|
| 4.9.6 | Observabilidad prod 7d — confirmar 0 incidentes P0 workspace |
| 4.9.7 | Retirar `LEGACY_INLINE` path y componentes `EncounterRightPane` |
| 4.9.8 | Flags compile-time → env obligatorio en CI |
| 4.9.9 | Eliminar exports deprecated Assist/Insights tras 0 tráfico |

---

## ENTREGABLE FINAL

| # | Ítem | Valor |
|---|------|-------|
| 1 | **Release Candidate Frontend** | `5eb09cef3a6a253a6f33ddab7e6217d679403bb3` (`5eb09cef`) |
| 2 | **Release Candidate Backend** | `c10e284577759d8b45c75130c23f2fe82f467490` (`c10e284`) |
| 3 | **Evidencia faltante para GO** | 18/18 ítems GO-LIVE CHECK (gl-01..gl-18) — ver Parte B |
| 4 | **Estrategia rollback** | Flags OFF + redeploy Vercel (Parte C); backend pin `c10e284` |
| 5 | **Roadmap post GO** | Retirement → E2E → UX → Analytics → Agents (Parte D) |

---

## Decisión Development Freeze

### ¿El desarrollo debe permanecer congelado hasta completar validación operacional?

# SÍ

**Justificación:**

1. RC frontend/backend identificado y acotado — cambios mid-validation invalidan E2E y smoke.
2. NO GO actual es **100% operacional** — no requiere código, requiere ejecutar checklist 4.9.4.
3. Rollback paths dependen de flags compile-time en RC `5eb09cef` — merges concurrentes aumentan riesgo incidente.
4. Post-GO roadmap (retirement, E2E, UX, Analytics, Agents) está **explícitamente diferido** hasta GO.

**Permitido durante freeze:**

- Ejecución ops (Vercel, E2E, smoke, Sentry)
- Documentación audit (4.9.x)
- Hotfix **P0 prod** con aprobación explícita producto + actualización RC documentada

**Prohibido durante freeze:**

- Nuevas fases clínicas, features, IA, Agents, Analytics
- Refactors workspace, retiro rollback, cambios UX no hotfix P0
- Merges backend salvo hotfix P0 API

---

## Referencias

- `docs/PHASE_4.9.4_GO_LIVE_OPERATIONAL_EXECUTION.md` — checklist evidencia
- `docs/PHASE_4.9.3_GO_LIVE_EXECUTION_AUDIT.md` — estado NO GO
- `docs/PHASE_4.9.2_GO_LIVE_PREPARATION.md` — runbook
- `lib/workspace-production-standardization-audit.ts` — rollback paths
