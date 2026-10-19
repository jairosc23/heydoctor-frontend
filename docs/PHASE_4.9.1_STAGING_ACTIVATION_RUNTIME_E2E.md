# Phase 4.9.1 — Staging Activation & Runtime E2E™

**Objetivo:** Validar HeyDoctor en condiciones reales — sin nuevas features, sin prod.

**Base:** Frontend `a0804dd6` (4.9.0) · Backend `c10e284` (sin cambios)

---

## PARTE A — Environment Audit

| Variable | Esperado | Visible en repo | Vercel prod |
|----------|----------|-----------------|-------------|
| `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE` | `1` | Comentado `.env.example`; default código `false` | **NO modificado** |
| `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE` | `1` | Comentado `.env.example`; default código `false` | **NO modificado** |

**Estado sesión 4.9.1:** sin acceso dashboard Vercel — valores staging/prod **no verificados**.

### Pasos activación Vercel (Preview/Staging — NO Production)

1. Vercel Dashboard → proyecto `heydoctor-frontend`
2. Settings → Environment Variables
3. `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE` = `1` → **Preview**
4. `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE` = `1` → **Preview**
5. **NO** modificar Production en 4.9.1
6. Redeploy preview
7. Validar `data-clinical-action-workspace="true"` y `data-columns="1"` (ADR-019)
8. Copiar `e2e/.env.e2e.example` → `.env.e2e`
9. `npm run test:e2e`

---

## PARTE B — Workspace Activation Checklist

- [ ] Variables Preview seteadas (ambos = 1)
- [ ] Production sin cambios
- [ ] Redeploy OK
- [ ] Layout 2-col + ClinicalActionBar
- [ ] Smart WS (`data-smart-workspace="true"`)
- [ ] Legacy `/panel/consultas` → banner redirect

**Estado 4.9.1:** checklist **no completado** (sin acceso Vercel).

---

## PARTE C — Runtime E2E

| Caso | Resultado |
|------|-----------|
| P0-1 HTA | **SKIPPED** |
| P0-2 DM2 | **SKIPPED** |
| P0-3 Aguda | **SKIPPED** |
| P0-4 Pago → Lock | **SKIPPED** |

**Ejecución:** `npm run test:e2e` → **10 skipped**, 0 pass, 0 fail

**Bloqueo:** sin `E2E_BASE_URL`, credenciales ni UUIDs seed.

---

## PARTE D — Post Deploy Smoke Test

| Superficie | Método | Estado |
|------------|--------|--------|
| Clinical Copilot | E2E | SKIPPED |
| LiveAiNoteSuggestions | E2E | SKIPPED |
| Orders Workspace | E2E | SKIPPED |
| Clinical Close Flow | E2E | SKIPPED |
| Document Generation | E2E | SKIPPED |
| Payment Gate (F1) | Static | PASS |
| Signed Documents Gate (F3) | Static | PASS |
| Legacy Guard (F4) | Static | PASS |

---

## Riesgos encontrados

1. **Crítico** — Sin acceso Vercel para activar/verificar flags staging
2. **Crítico** — E2E runtime no ejecutado (0/4 P0)
3. **Alto** — Seeds consulta no provisionados
4. **Alto** — P0-4 depende Payku sandbox staging
5. **Medio** — Flags compile-time requieren redeploy

---

## Recomendación operacional

1. Ops activa flags en **Preview** siguiendo pasos Parte A
2. Provisionar seeds HTA/DM2/Aguda/Pago en staging
3. Crear `.env.e2e` desde `e2e/.env.e2e.example`
4. Ejecutar `npm run test:e2e` — requiere 4/4 PASS
5. Smoke manual 24h en preview
6. Solo entonces → Phase 4.9.2 prod flags

---

## GO / NO GO — Activación permanente workspace en **producción**

# NO GO

**Bloquea la activación:**

1. Flags workspace **no activados ni verificados** en staging/preview
2. Runtime E2E **0/4 casos P0 ejecutados** (10 tests skipped)
3. Smoke clínico runtime **5/5 superficies pendientes**
4. Producción **intencionalmente no modificada** en 4.9.1 (correcto por alcance)

---

## Archivos

- `lib/staging-activation-runtime-e2e-audit.ts`
- `e2e/.env.e2e.example`
- `docs/PHASE_4.9.1_STAGING_ACTIVATION_RUNTIME_E2E.md`
