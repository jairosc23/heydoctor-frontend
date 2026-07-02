# Phase 4.9.4 — GO-Live Operational Execution™

**Objetivo:** Acompañar y registrar la ejecución real del checklist operacional.

**Base:** Frontend `5eb09cef` · Backend `c10e284` · **Sin código · Sin commits funcionales**

**Experiencia objetivo:** Clinical Action Workspace™ + Smart Clinical Workspace™ (ambos flags ON)

---

## Convenciones de evidencia

| Campo | Formato |
|-------|---------|
| **Session ID** | `GO494-YYYYMMDD-HHMM` (ej. `GO494-20260610-1430`) |
| **Evidencia ID** | `{SESSION_ID}/{ITEM_ID}` (ej. `GO494-20260610-1430/gl-03`) |
| **Capturas** | `{SESSION_ID}/{ITEM_ID}-{seq}.png` |
| **Logs** | `{SESSION_ID}/{ITEM_ID}.log` |
| **Reporte E2E** | `playwright-report/index.html` + `{SESSION_ID}/e2e-summary.txt` |
| **Ejecutor** | Nombre + rol |
| **Entorno** | URL preview/prod + commit deploy |

**Resultados válidos:** `PASS` · `FAIL` · `N/A` (solo preview gl-* cuando el ítem no aplica al entorno)

**Regla:** No marcar PASS sin evidencia adjunta o referencia verificable.

---

## PARTE A — Preview Activation Check (gl-01 → gl-06)

**Prerequisitos:** Acceso Vercel `heydoctor-frontend` · consulta staging UUID · viewport ≥1280px

### Registro de sesión

| Campo | Valor |
|-------|-------|
| Session ID | |
| Ejecutor | |
| Fecha/hora inicio | |
| Preview URL | |
| Deploy commit | |
| Backend API | |

### Checklist gl-01 → gl-06

| ID | Criterio | Resultado | Evidencia | Notas / bloqueo |
|----|----------|-----------|-----------|-----------------|
| **gl-01** | `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1` scope **Preview** | ☐ PASS ☐ FAIL ☐ N/A | Captura Vercel env vars | |
| **gl-01** | `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1` scope **Preview** | ☐ PASS ☐ FAIL ☐ N/A | Misma captura o segunda | Ambos deben ser PASS |
| **gl-02** | Redeploy preview sin error build | ☐ PASS ☐ FAIL ☐ N/A | Link deployment + build log | |
| **gl-03** | **v-layout-2col** — `[data-testid=encounter-split-layout]` con `data-columns="2"` y `data-clinical-action-workspace="true"` | ☐ PASS ☐ FAIL ☐ N/A | Captura DevTools + pantalla | |
| **gl-04** | **v-smart-soap** — sección SOAP con `data-smart-workspace="true"` | ☐ PASS ☐ FAIL ☐ N/A | Captura SOAP compacto | |
| **gl-05** | **v-action-bar** — `ClinicalActionBar` visible con chips Recetas/Lab/Documentos/… | ☐ PASS ☐ FAIL ☐ N/A | Captura action bar | Clic Recetas → sheet lateral PASS opcional aquí |
| **gl-06** | **v-legacy-blocked** — `/panel/consultas` con consulta activa: banner redirect, **sin** Rx/Lab inline legacy | ☐ PASS ☐ FAIL ☐ N/A | Captura listado consultas | |

### Validaciones adicionales recomendadas (no bloquean gl-* individual)

| ID visual | Qué verificar | Resultado | Evidencia |
|-----------|---------------|-----------|-----------|
| v-module-sheet | Clic Recetas → `[data-testid=clinical-module-sheet]` visible | ☐ PASS ☐ FAIL | |
| v-close-flow | PatientSnapshot: Documentar → Revisar → Firmar → Entregar | ☐ PASS ☐ FAIL | |
| v-no-3col | Layout desktop **NO** `data-columns="3"` | ☐ PASS ☐ FAIL | |

### Criterio fase Preview

```
previewReady = gl-01 PASS AND gl-02 PASS AND gl-03..gl-06 todos PASS (sin N/A en ítems required)
```

**Estado sesión 4.9.4 (inicial):** ☐ previewReady — pendiente ejecución ops

---

## PARTE B — E2E Execution Record (P0-1 → P0-4)

**Prerequisitos:** previewReady · `.env.e2e` completo (7 variables) · backend staging accesible

### Registro E2E

| Campo | Valor |
|-------|-------|
| Session ID | |
| Ejecutor | |
| Fecha/hora | |
| `E2E_BASE_URL` | |
| Playwright versión | |
| Comando | `./e2e/run-e2e.sh` o `npm run test:e2e` |
| Tests totales / passed / failed / skipped | |

### gl-07 — Variables entorno

| Variable | Presente | Valor enmascarado | Resultado gl-07 |
|----------|----------|-------------------|-----------------|
| `E2E_BASE_URL` | ☐ | | |
| `E2E_DOCTOR_EMAIL` | ☐ | | |
| `E2E_DOCTOR_PASSWORD` | ☐ | *** | |
| `E2E_CONSULTATION_HTA` | ☐ | UUID | |
| `E2E_CONSULTATION_DM2` | ☐ | UUID | |
| `E2E_CONSULTATION_ACUTE` | ☐ | UUID | |
| `E2E_CONSULTATION_PAYMENT` | ☐ | UUID | |

**gl-07:** ☐ PASS (7/7) ☐ FAIL

### Casos P0

#### P0-1 HTA — Memory → SOAP → Receta → Firma → PDF

| Campo | Valor |
|-------|-------|
| **gl-08** | ☐ PASS ☐ FAIL |
| Consulta UUID | |
| Duración | |
| Assertions clave | Layout 2-col · Memory rail · SOAP autosave · Module sheet Recetas · Firma · Close Flow |

**Evidencia adjunta:**

| Tipo | Archivo / referencia |
|------|---------------------|
| Captura layout 2-col | |
| Captura memory + SOAP saved | |
| Captura module sheet recetas | |
| Captura post-firma | |
| Error (si FAIL) | |
| Log Playwright | `{SESSION_ID}/P0-1.log` |

---

#### P0-2 DM2 — Lab order → plan → firma

| Campo | Valor |
|-------|-------|
| **gl-09** | ☐ PASS ☐ FAIL |
| Consulta UUID | |
| Duración | |
| Assertions clave | Action bar Lab · Sheet `data-module` lab · Crear orden · Firma |

**Evidencia adjunta:**

| Tipo | Archivo / referencia |
|------|---------------------|
| Captura lab sheet | |
| Captura post-firma | |
| Error (si FAIL) | |
| Log Playwright | `{SESSION_ID}/P0-2.log` |

---

#### P0-3 Consulta Aguda — SOAP → Copilot → documento → cierre

| Campo | Valor |
|-------|-------|
| **gl-10** | ☐ PASS ☐ FAIL |
| Consulta UUID | |
| Duración | |
| Assertions clave | `data-smart-workspace="true"` · autosave · Copilot abre · Firma · Sheet documentos |

**Evidencia adjunta:**

| Tipo | Archivo / referencia |
|------|---------------------|
| Captura smart SOAP | |
| Captura Copilot | |
| Captura documentos sheet | |
| Error (si FAIL) | |
| Log Playwright | `{SESSION_ID}/P0-3.log` |

---

#### P0-4 Pago → Lock

| Campo | Valor |
|-------|-------|
| **gl-11** | ☐ PASS ☐ FAIL ☐ SKIP documentado |
| Consulta UUID | |
| Duración | |
| Assertions clave | Estado signed · Botón pago visible · Payku/sandbox · locked/pagada · SOAP disabled |

**Nota:** SKIP documentado solo si Payku sandbox requiere intervención manual no disponible en CI — debe incluir razón escrita y plan de validación manual equivalente.

**Evidencia adjunta:**

| Tipo | Archivo / referencia |
|------|---------------------|
| Captura pre-pago (signed) | |
| Captura Payku / retorno | |
| Captura locked | |
| Error (si FAIL) | |
| Log Playwright | `{SESSION_ID}/P0-4.log` |

---

### Resumen E2E

| ID | Caso | Resultado |
|----|------|-----------|
| gl-07 | `.env.e2e` completo | |
| gl-08 | P0-1 HTA | |
| gl-09 | P0-2 DM2 | |
| gl-10 | P0-3 Aguda | |
| gl-11 | P0-4 Pago | |

```
e2eReady = gl-07 PASS AND gl-08..gl-11 PASS (gl-11 SKIP documentado NO cuenta como PASS para prod GO)
```

**Estado sesión 4.9.4 (inicial):** ☐ e2eReady — pendiente ejecución ops

---

## PARTE C — Smoke Test Record

**Entorno:** Preview con flags ON (post gl-01..02) · misma URL E2E · consulta staging apropiada

### Registro Smoke

| Campo | Valor |
|-------|-------|
| Session ID | |
| Ejecutor | |
| Fecha/hora | |
| Consulta UUID usada | |
| Viewport | Desktop ≥1280px |

### Superficies clínicas

| Superficie | Qué validar | Resultado | Evidencia |
|------------|-------------|-----------|-----------|
| **Clinical Copilot™** | Botón Copilot abre panel sin error; contenido visible | ☐ PASS ☐ FAIL | Captura + consola sin error crítico |
| **LiveAiNoteSuggestions™** | Sugerencias contextuales visibles en SOAP (si aplica al caso) | ☐ PASS ☐ FAIL ☐ N/A | Captura |
| **Clinical Action Workspace™** | Layout 2-col + action bar operativo | ☐ PASS ☐ FAIL | Captura |
| **Clinical Module Sheet™** | Abrir Recetas/Lab/Documentos — sheet lateral funcional | ☐ PASS ☐ FAIL | Captura por módulo |
| **Clinical Close Flow™** | Fases Documentar/Revisar/Firmar/Entregar coherentes con estado consulta | ☐ PASS ☐ FAIL | Captura |
| **Documents** | PDF/docs **deshabilitados** pre-firma; habilitados post-firma | ☐ PASS ☐ FAIL | Captura pre y post |
| **Payment** | Botón pago **NO** visible en `completed` sin firma; visible en `signed` según gate | ☐ PASS ☐ FAIL | Captura por estado |
| **Signature** | Firma completa flujo canvas → confirmar → estado signed | ☐ PASS ☐ FAIL | Captura |

### Mapeo GO-LIVE CHECK smoke

| ID | Criterio automatizado / manual | Resultado | Evidencia |
|----|-------------------------------|-----------|-----------|
| **gl-12** | Clinical Copilot abre sin error | ☐ PASS ☐ FAIL | |
| **gl-13** | Autosave indicator "guardado/saved" tras edit SOAP | ☐ PASS ☐ FAIL | |
| **gl-14** | Payment gate: botón pago NO visible en completed pre-firma | ☐ PASS ☐ FAIL | |
| **gl-15** | Signed docs gate: PDF disabled pre-firma | ☐ PASS ☐ FAIL | |

```
smokeReady = gl-12..gl-15 todos PASS
```

**Estado sesión 4.9.4 (inicial):** ☐ smokeReady — pendiente ejecución ops

---

## PARTE D — Production Activation (gl-16 → gl-18)

Ejecutar **solo** si `previewReady + e2eReady + smokeReady`.

| ID | Criterio | Resultado | Evidencia |
|----|----------|-----------|-----------|
| **gl-16** | Repetir gl-01/gl-02 en scope **Production** (Action=1, Smart=1) | ☐ PASS ☐ FAIL | Captura Vercel prod env |
| **gl-17** | Redeploy prod con flags ON — build OK | ☐ PASS ☐ FAIL | Link deployment |
| **gl-18** | Smoke post-prod 24h — sin incidentes Sentry críticos workspace | ☐ PASS ☐ FAIL | Link Sentry + resumen |

---

## Decisión final GO / NO GO

Completar cuando **gl-01 → gl-18** estén registrados.

### Matriz de decisión

| Condición | Requerido |
|-----------|-----------|
| gl-01..06 | Todos PASS |
| gl-07..11 | Todos PASS (gl-11 sin SKIP no documentado) |
| gl-12..15 | Todos PASS |
| gl-16..18 | Todos PASS |
| Bloqueadores código (F1–F4) | Cerrados (4.9.0) |

### Plantilla veredicto

```
┌─────────────────────────────────────────────────────────────┐
│ DECISIÓN FINAL — Clinical Action Workspace™                 │
│              + Smart Clinical Workspace™                    │
│              como experiencia oficial permanente            │
├─────────────────────────────────────────────────────────────┤
│ Session ID:                                                 │
│ Fecha decisión:                                             │
│ Decisión:  ☐ GO    ☐ NO GO                                 │
├─────────────────────────────────────────────────────────────┤
│ GO-LIVE CHECK: ___/18 PASS                                  │
│ previewReady: ☐  e2eReady: ☐  smokeReady: ☐  prodReady: ☐ │
└─────────────────────────────────────────────────────────────┘
```

---

### Si NO GO — bloqueo residual exacto

| # | Ítem fallido / pendiente | Tipo | Acción correctiva |
|---|--------------------------|------|-------------------|
| 1 | | Operacional / Técnico | |
| 2 | | | |
| 3 | | | |

---

### Si GO — riesgos residuales aceptados

| ID | Riesgo | Severidad | Mitigación |
|----|--------|-----------|------------|
| F6 | `chiefComplaint` fuera de autosave SOAP | Baja | Monitoreo; fix en fase posterior |
| F7 | Close Flow no consulta órdenes vía API | Baja | Validación manual periódica |
| P0-4 | Payku sandbox puede requerir paso manual | Media | Confirmar gate pago en prod con transacción real controlada |
| Flags | Rollback paths legacy aún en código | Baja | Retiro gradual 4.9.5+ |

### Si GO — recomendación activación Production

1. Activar **simultáneamente** en Production:
   - `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1`
   - `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1`
2. Redeploy prod (gl-17) en ventana acordada con ops.
3. Smoke post-deploy inmediato (subset Parte C en prod).
4. Monitoreo Sentry 24h (gl-18) antes de declarar estable.

### Si GO — recomendación retiro gradual rollback (4.9.5+)

| Fase | Acción | Prerequisito |
|------|--------|--------------|
| 4.9.5 | Observabilidad prod 7d sin incidentes P0 | gl-18 PASS |
| 4.9.6 | Retirar `LEGACY_INLINE_CONSULTATION_WORKSPACE` path en `/panel/consultas` | E2E PASS en prod-like |
| 4.9.7 | Eliminar compile-time defaults false → flags obligatorias en CI | 4.9.6 estable |
| 4.9.8 | Remover componentes deprecated Assist/Insights si sin tráfico | Analytics confirma 0 uso |

**No retirar flags ni rollback paths hasta completar 4.9.5 observabilidad.**

---

## Estado Phase 4.9.4 — sesión documental (sin ejecución ops)

| Bloque | Estado |
|--------|--------|
| Parte A gl-01..06 | Plantilla entregada — **0 PASS registrados** |
| Parte B P0 + gl-07..11 | Plantilla entregada — **0 PASS registrados** |
| Parte C Smoke gl-12..15 | Plantilla entregada — **0 PASS registrados** |
| Parte D gl-16..18 | Plantilla entregada — **pendiente preview+e2e+smoke** |

### Decisión final (estado actual)

# NO GO

**Bloqueo residual exacto:**

1. **gl-01 → gl-18:** ningún ítem ejecutado y registrado con evidencia en sesión ops real.
2. **Preview:** flags workspace no verificados en Vercel Preview.
3. **E2E runtime:** 0/4 P0 PASS — última evidencia 4.9.1: 10 tests skipped.
4. **Smoke runtime:** gl-12..15 no ejecutados en staging/preview.

No existen bloqueadores técnicos de código abiertos (4.9.3). El NO GO es **exclusivamente operacional** hasta completar este documento con evidencia.

---

## Referencias

- Runbook: `docs/PHASE_4.9.2_GO_LIVE_PREPARATION.md`
- Audit estado: `docs/PHASE_4.9.3_GO_LIVE_EXECUTION_AUDIT.md`
- E2E spec: `e2e/clinical-p0.spec.ts`
- Env plantilla: `e2e/.env.e2e.example`
- Wrapper: `e2e/run-e2e.sh`
