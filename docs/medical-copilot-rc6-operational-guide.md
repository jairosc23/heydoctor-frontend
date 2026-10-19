# Medical Copilot RC6 — Operational Guide

## Daily ops (certified stack)

1. Trabajar solo en `release/medical-copilot-v1.0-rc2` hasta promoción formal
2. Backend: `format` → `lint` → `build` → `test`
3. Frontend: `lint` → `build` → `test` → Playwright crítico
4. Revisar `docs/medical-copilot-rc5-diagnostics.json` y `rc6-certification-checklist.json`
5. Observabilidad interna: RC5 percentiles / cache / concurrency (sin sinks externos)

## Kill-switch

- Runtime `MEDICAL_COPILOT_ENABLED` deshabilita superficie sin borrar SSOT
- FE respeta kill-switch remoto + fallback env (cubierto por E2E AR-2)

## Session ownership

- Una `sessionId` activa por consulta (GA-FIX)
- Ownership restaurado en auth recovery (RC-2 E2E)

## Do not

- Ampliar SSOT
- Añadir endpoints governed
- Merge a main / deploy sin checklist de promoción post-QA
