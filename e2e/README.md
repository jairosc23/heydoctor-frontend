# Clinical E2E P0 — Phase 19.2 / PQ-01

Especificación ejecutable Playwright para validar flujos clínicos P0 con **workspace oficial** (Action WS + Smart WS ON), alineada al contrato **ADR-019**.

**Hardening PQ-01:** fixtures/helpers de auth y navegación, suite serial, retries CI, traces/artefactos, example sin secretos, script `test:e2e:p0`.

**Referencia normativa:** [`docs/architecture/adr/019-clinical-workspace-observability-contract.md`](../docs/architecture/adr/019-clinical-workspace-observability-contract.md)  
**Informe PQ-01:** [`docs/pq-01-playwright-hardening.md`](../docs/pq-01-playwright-hardening.md)

## Contrato ADR-019 (workspace oficial ON)

| Selector / atributo | Valor esperado | GO-LIVE |
|---|---|---|
| `[data-testid="encounter-split-layout"]` | visible desktop xl+ | gl-03 |
| `data-clinical-action-workspace` | `"true"` | gl-03, gl-05 |
| `data-columns` | `"1"` (generación B) | gl-03 |
| `data-smart-workspace` | `"true"` en shell SOAP | gl-04 |
| `[data-testid="clinical-action-bar"]` | visible | gl-05 |
| `[data-testid="clinical-context-panels"]` | visible | P0-1 |
| `[data-testid="clinical-navigation-rail"]` | visible desktop | P0-0 |

El término visual «layout 2-col» en runbooks describe nav rail + columna clínica simultáneos; **no** implica `data-columns="2"`.

## Instalación

```bash
npm ci
npx playwright install chromium
```

## Variables de entorno

Copiar plantilla a la **raíz del repo** (ignorada por git):

```bash
cp e2e/.env.e2e.example .env.e2e
```

Editar `.env.e2e` — **7 variables obligatorias** (placeholders en el example; no commitear credenciales):

```env
E2E_BASE_URL=https://your-preview-url.vercel.app
E2E_DOCTOR_EMAIL=medico@example.com
E2E_DOCTOR_PASSWORD=***

E2E_CONSULTATION_HTA=uuid-consulta-hta
E2E_CONSULTATION_DM2=uuid-consulta-dm2
E2E_CONSULTATION_ACUTE=uuid-consulta-aguda
E2E_CONSULTATION_PAYMENT=uuid-consulta-signed
```

**Build Preview debe incluir:**

```env
NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1
NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1
NEXT_PUBLIC_HEYDOCTOR_API_URL=https://pro-api.heydoctor.health
```

## Ejecución local / Preview

```bash
cp e2e/.env.e2e.example .env.e2e
# Editar .env.e2e (7 variables reales del entorno target)
chmod +x e2e/run-e2e.sh
./e2e/run-e2e.sh
```

Alternativas:

```bash
set -a && source .env.e2e && set +a
npm run test:e2e:p0          # solo Clinical P0 (recomendado)
npm run test:e2e             # todos los proyectos Playwright
```

**Viewport P0:** desktop **1440×900**.  
**Aislamiento:** cada test limpia cookies y re-autentica (`loginAsDoctor`). Suite en modo `serial`.

## Infraestructura PQ-01

| Pieza | Path |
|---|---|
| Config | `e2e/playwright.config.ts` |
| Fixtures | `e2e/fixtures/p0.ts` |
| Auth helper | `e2e/helpers/auth.ts` |
| Env helper | `e2e/helpers/env.ts` |
| Encounter helper | `e2e/helpers/encounter.ts` |
| Spec P0 | `e2e/clinical-p0.spec.ts` |

**CI retries:** 2 · **trace/screenshot/video:** retain-on-failure · **reporter:** list + html + junit (CI).

## Matriz test ↔ GO-LIVE (gl-07..gl-11)

| Test | Flujo | ADR-019 | GO-LIVE | Seed |
|---|---|---|---|---|
| Setup | `.env.e2e` completo | — | **gl-07** | 7 vars |
| P0-0 | Patient context bar sticky | nav rail, chrome | gl-05 parcial | `E2E_CONSULTATION_HTA` |
| P0-1 | HTA → Memory → SOAP → Receta → Firma | `data-columns=1`, action WS | **gl-08** | `E2E_CONSULTATION_HTA` |
| P0-2 | DM2 → Lab → Firma | action bar, module sheet | **gl-09** | `E2E_CONSULTATION_DM2` |
| P0-3 | Aguda → SOAP → Copilot → Documento | `data-smart-workspace` | **gl-10** | `E2E_CONSULTATION_ACUTE` |
| P0-4 | Firma → Pago Payku → Lock | pago post-firma | **gl-11** | `E2E_CONSULTATION_PAYMENT` |
| Smoke | Atributos `data-*` workspace | contrato completo | gl-03 | `E2E_CONSULTATION_HTA` |

**gl-11 / P0-4:** puede `skip` si Payku sandbox requiere intervención manual — limitación remanente PQ-01.

## CI Gate (Phase 19.3 / PQ-01)

GitHub Actions ejecuta **solo** `npm run test:e2e:p0` cuando los **7 repository secrets** están configurados.

| Secrets | Comportamiento CI | Resumen job |
|---|---|---|
| Los 7 presentes | E2E P0 bloqueante + upload artefactos | `Secrets: configured` · `PASS`/`FAIL` |
| Cualquiera ausente | E2E omitido | `Secrets: skipped` · `SKIPPED` |

Artefactos: `playwright-report/` + `test-results/` (retention 14 días).

**Política gate obligatorio:** ver `docs/pq-01-playwright-hardening.md` (GO CONDICIONAL — P0-4 Payku + secrets opcionales en forks).

## Activación Vercel Preview (pre-requisito ops)

1. Settings → Environment Variables → flags workspace `=1` scope **Preview**
2. Configurar `NEXT_PUBLIC_HEYDOCTOR_API_URL`
3. NO modificar Production hasta GO operacional
4. Redeploy preview → validar ADR-019 en DevTools
5. Ejecutar `./e2e/run-e2e.sh` con `.env.e2e` real

## Referencia

- `docs/pq-01-playwright-hardening.md`
- `lib/go-live-preparation-audit.ts`
- `docs/PHASE_4.9.2_GO_LIVE_PREPARATION.md`
