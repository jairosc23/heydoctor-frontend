# Medical Copilot RC6 — Developer Guide

## Golden rules

1. Branch de trabajo: `release/medical-copilot-v1.0-rc2` (no `main`)
2. SSOT congelado — no añadir `governed-*` nuevos
3. Prefijos conflictivos documentados: no reutilizar nombres de orchestrator/workflow existentes
4. Cambios operacionales van en `rc*-operational` solo si hay RC formal; RC6 es docs/certificación

## Local validation

```bash
# Backend
npm run format && npm run lint && npm run build && npm test

# Frontend
npm run lint && npm run build && npm test
npx playwright test --config e2e/playwright.config.ts \
  e2e/medical-copilot-rc2.spec.ts e2e/ar2-foundation.spec.ts e2e/ga-fix-deeplink.spec.ts
```

## Reading order

1. `medical-copilot-rc6.md`
2. `medical-copilot-ssot-catalog-rc3.md`
3. `medical-copilot-rc4.md` / `medical-copilot-rc5.md`
4. `medical-copilot-rc6-architecture.md`
5. `medical-copilot-rc6-security-review.md`

## Envelope / contracts

- `medical-copilot-api.envelope.ts`
- RC5 contract baseline + drift specs
