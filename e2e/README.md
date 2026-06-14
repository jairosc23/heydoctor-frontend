# Clinical E2E P0 — Phase 4.8.6

Especificación ejecutable Playwright para validar flujos clínicos P0 con **workspace oficial** (Action WS + Smart WS ON).

## Instalación

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## Variables de entorno

Copiar plantilla:

```bash
cp e2e/.env.e2e.example .env.e2e
```

Editar `.env.e2e` (no commitear credenciales):

```env
E2E_BASE_URL=https://staging.heydoctor.health
E2E_DOCTOR_EMAIL=medico@example.com
E2E_DOCTOR_PASSWORD=***

# Seeds opcionales por caso
E2E_CONSULTATION_HTA=uuid-consulta-hta
E2E_CONSULTATION_DM2=uuid-consulta-dm2
E2E_CONSULTATION_ACUTE=uuid-consulta-aguda
E2E_CONSULTATION_PAYMENT=uuid-consulta-signed
```

**Build staging debe incluir:**

```env
NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1
NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1
```

## Ejecución (Phase 4.9.2)

```bash
cp e2e/.env.e2e.example .env.e2e
# Editar .env.e2e (7 variables)
chmod +x e2e/run-e2e.sh
./e2e/run-e2e.sh
```

Alternativa:

```bash
set -a && source .env.e2e && set +a
npm run test:e2e
```

## Casos P0

| ID | Flujo | Env seed |
|----|-------|----------|
| P0-1 | HTA → Memory → SOAP → Receta → Firma → PDF | `E2E_CONSULTATION_HTA` |
| P0-2 | DM2 → Lab → Plan → Firma | `E2E_CONSULTATION_DM2` |
| P0-3 | Aguda → SOAP → Copilot → Documento | `E2E_CONSULTATION_ACUTE` |
| P0-4 | Firma → Pago Payku → Lock | `E2E_CONSULTATION_PAYMENT` |

## Flags a probar

| Combinación | Cuándo |
|-------------|--------|
| Action=1, Smart=1 | **Obligatorio** — workspace oficial |
| Action=0, Smart=0 | Opcional P1 — regression rollback |

## Referencia

- `lib/clinical-e2e-production-readiness-audit.ts`
- `lib/staging-activation-runtime-e2e-audit.ts`
- `docs/PHASE_4.8.6_CLINICAL_E2E_PRODUCTION_READINESS.md`
- `docs/PHASE_4.9.2_GO_LIVE_PREPARATION.md`

## Activación Vercel Preview (Phase 4.9.1)

1. Settings → Environment Variables → ambos flags `=1` scope **Preview**
2. NO modificar Production hasta GO E2E
3. Redeploy preview → validar layout 2-col
4. Ejecutar `npm run test:e2e` con `.env.e2e`
