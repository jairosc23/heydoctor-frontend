# Phase 4.9.2 — GO-Live Preparation™

**Objetivo:** Preparar activación real del workspace oficial — sin features, sin UX, sin prod.

**Base:** Frontend `d2cc61a9` (4.9.1) · Backend `c10e284`

---

## PARTE A — Operations Runbook (Vercel Preview)

### Checklist

| # | Acción | Verificar |
|---|--------|-----------|
| 1 | Vercel → `heydoctor-frontend` | Proyecto accesible |
| 2 | Settings → Environment Variables | Panel abierto |
| 3 | `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE` = `1` → **Preview only** | Scope Preview ✓ |
| 4 | `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE` = `1` → **Preview only** | Scope Preview ✓ |
| 5 | Deployments → Redeploy preview | Build OK |
| 6 | Copiar URL preview | `/login` responde 200 |
| 7 | Login → `/panel/consultas/[uuid]` (≥1280px) | Validaciones visuales |
| 8 | Completar GO-LIVE CHECK gl-01..gl-06 | Todos PASS |

### Validaciones visuales esperadas

| ID | Qué ver | Esperado |
|----|---------|----------|
| v-layout-2col | `[data-testid=encounter-split-layout]` | `data-columns="2"`, `data-clinical-action-workspace="true"` |
| v-smart-soap | SOAP section | `data-smart-workspace="true"` |
| v-action-bar | Chrome encounter | `ClinicalActionBar` con chips Recetas/Lab/… |
| v-module-sheet | Clic Recetas | Sheet lateral visible |
| v-close-flow | Bajo PatientSnapshot | Documentar → Revisar → Firmar → Entregar |
| v-legacy-blocked | `/panel/consultas` con consulta activa | Banner redirect, **sin** Rx/Lab inline |
| v-no-3col | Layout desktop | **NO** `data-columns="3"` |

**Rollback:** eliminar vars Preview → redeploy.

---

## PARTE B — E2E Execution Guide

### Dependencias

```bash
npm install --include=dev
npx playwright install chromium
```

Backend staging `c10e284` accesible. Vercel Preview con `NEXT_PUBLIC_HEYDOCTOR_API_URL` correcto.

### Variables requeridas (7)

| Variable | Obligatorio | Uso |
|----------|-------------|-----|
| `E2E_BASE_URL` | Sí | URL preview Vercel |
| `E2E_DOCTOR_EMAIL` | Sí | Login médico |
| `E2E_DOCTOR_PASSWORD` | Sí | Login médico |
| `E2E_CONSULTATION_HTA` | Sí | P0-1 |
| `E2E_CONSULTATION_DM2` | Sí | P0-2 |
| `E2E_CONSULTATION_ACUTE` | Sí | P0-3 |
| `E2E_CONSULTATION_PAYMENT` | Sí | P0-4 (signed + Payku) |

### Pasos exactos

```bash
cd heydoctor-frontend
git pull origin main   # ≥ d2cc61a9
npm install --include=dev
npx playwright install chromium
cp e2e/.env.e2e.example .env.e2e
# Editar .env.e2e — completar las 7 variables
chmod +x e2e/run-e2e.sh
./e2e/run-e2e.sh
```

Alternativa manual:

```bash
set -a && source .env.e2e && set +a
npm run test:e2e
```

### Resultado esperado

- **10 tests** (5 desktop + 5 mobile)
- **0 skipped** si `.env.e2e` completo
- **P0-4** puede skip si Payku requiere intervención manual
- Reporte HTML: `playwright-report/index.html`

### Archivos auditados

| Archivo | Rol |
|---------|-----|
| `e2e/playwright.config.ts` | Config: 2 projects, timeout 120s, workers 1 |
| `e2e/clinical-p0.spec.ts` | 4 casos P0 + smoke layout |
| `e2e/.env.e2e.example` | Plantilla variables |
| `e2e/run-e2e.sh` | Wrapper con validación env |

---

## PARTE C — GO-LIVE CHECK

### Fases

| Fase | Ítems | Requerido para prod |
|------|-------|---------------------|
| **Preview** | gl-01..gl-06 | Sí |
| **E2E** | gl-07..gl-11 | Sí |
| **Smoke** | gl-12..gl-15 | Sí |
| **Prod** | gl-16..gl-18 | Sí (después de preview+e2e) |

### Criterio GO producción

```
previewReady (gl-01..06) + e2eReady (gl-07..11) + prod (gl-16..18)
```

### Estado Phase 4.9.2

**PENDING_OPS** — runbook entregado; ejecución pendiente equipo ops.

---

## Veredicto activación workspace en producción

**NO GO** (sin cambio vs 4.9.1)

Bloquea:
1. Flags no verificadas en Vercel Preview
2. Runtime E2E no ejecutado
3. GO-LIVE CHECK incompleto

**Próximo paso ops:** ejecutar Parte A → B → marcar Parte C → entonces gl-16 prod.

---

## Referencia código

- `lib/go-live-preparation-audit.ts`
- `lib/staging-activation-runtime-e2e-audit.ts` (4.9.1)
