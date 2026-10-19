# PQ-01 — Playwright P0 Hardening

**Épica:** EPIC 1B  
**Iniciativa:** PQ-01  
**Fecha:** 2026-07-17  
**Repo:** `jairosc23/heydoctor-frontend`  
**Rama:** `feature/v1.1-platform-evolution`  
**Alcance:** Solo infraestructura Playwright. Sin pruebas funcionales nuevas. Sin cambios de negocio / Backend / APIs.

---

## 1. Archivos modificados / creados

### Creados

| Path | Rol |
|------|-----|
| `e2e/helpers/env.ts` | Contrato env, strict mode, consultation IDs |
| `e2e/helpers/auth.ts` | Login doctor determinístico + aislamiento cookies |
| `e2e/helpers/encounter.ts` | `gotoConsultation` + `visibleEncounterSection` |
| `e2e/fixtures/p0.ts` | Fixture `doctorPage` + suite serial |
| `docs/pq-01-playwright-hardening.md` | Este informe |
| `docs/pq-01-playwright-hardening.json` | Evidencia machine-readable |

### Modificados

| Path | Cambio |
|------|--------|
| `e2e/clinical-p0.spec.ts` | Usa fixtures/helpers; misma cobertura P0-0..P0-4 + smoke |
| `e2e/playwright.config.ts` | Retries CI=2, timeouts, trace retain-on-failure, junit, locale/TZ |
| `e2e/.env.e2e.example` | Placeholders (sin credenciales/UUIDs reales) |
| `e2e/run-e2e.sh` | Valida 7 vars; ejecuta `test:e2e:p0` |
| `e2e/README.md` | Documentación PQ-01 |
| `.github/workflows/ci.yml` | `test:e2e:p0`, `E2E_STRICT`, upload artefactos |
| `package.json` | Script `test:e2e:p0` |
| `.gitignore` | `e2e/.auth/` |

---

## 2. Cambios realizados (resumen)

1. **Auth de pruebas:** `loginAsDoctor` limpia cookies, espera form, click + `waitForURL` fuera de `/login`.  
2. **Sesión / aislamiento:** fixture `doctorPage` re-autentica por test; suite `serial`.  
3. **Sincronización:** `gotoConsultation` espera chrome/layout (Preview-friendly vs `networkidle`).  
4. **Timeouts:** `actionTimeout` 20s, `navigationTimeout` 60s, expect 15s, test 120s.  
5. **Retry policy:** CI `retries: 2`; local `0`.  
6. **Reporter / artefactos:** html + junit (CI); upload `playwright-report/` + `test-results/` en Actions.  
7. **Datos:** example redactado; strict mode en CI evita skip silencioso por UUID faltante.  
8. **CI:** `npm run test:e2e:p0` + artefactos; gate summary sin cambio de semántica skip-without-secrets.

---

## 3. Justificación técnica

| Problema previo | Mitigación PQ-01 |
|-----------------|------------------|
| Login inline duplicado / frágil | Helper único con esperas explícitas |
| Sin aislamiento de cookies entre tests | `clearCookies` + re-login |
| Fallos Preview difíciles de depurar | Trace/video/screenshot + artifact upload |
| Example con secretos reales | Placeholders only |
| `continue-on-error` sin artefactos | Upload siempre que E2E corrió |
| Skip silencioso de UUIDs en CI | `E2E_STRICT` / `CI=true` → error explícito |

No se añadieron casos de negocio; la matriz P0 se preservó.

---

## 4. Validaciones ejecutadas

| Check | Resultado |
|-------|-----------|
| `playwright --list` project P0 | **6 tests** listados |
| `npm run test:e2e:p0` sin secrets | **6 skipped** (determinístico, exit 0) |
| `tsc --noEmit` | **PASS** (sin errores reportados) |
| Ejecución contra Preview con secrets reales | **No ejecutada en este entorno** (sin `.env.e2e` / secrets locales) |

Limitación de validación: la corrida autenticada contra Preview queda como gate ops/CI cuando secrets estén configurados.

---

## 5. Riesgos remanentes

| ID | Riesgo | Severidad |
|----|--------|-----------|
| L1 | **P0-4 Payku** puede `test.skip` si sandbox requiere intervención manual | Alta p/ gate 100% |
| L2 | Seeds staging mutables (firma/pago) → no-idempotencia entre corridas | Media |
| L3 | Secrets ausentes → CI `SKIPPED` (job verde) — no es gate always-on | Media |
| L4 | Cold start Preview puede consumir retries | Baja |
| L5 | Copilot click en P0-3 depende de copy UI | Baja (preexistente) |

---

## 6. Estado de la suite Playwright P0

| Atributo | Estado |
|----------|--------|
| Determinística (infra) | **Mejorada** — auth/nav/serial/strict |
| Flakes conocidos infra | Mitigados (retries + waits); **P0-4** sigue condicional |
| Repetible local | **Sí** — `./e2e/run-e2e.sh` / `npm run test:e2e:p0` |
| Compatible CI | **Sí** — workflow actualizado |
| Compatible Preview | **Sí** — mismo contrato env + flags workspace |
| Cobertura funcional | **Sin cambios** (6 tests) |

---

## 7. GO / NO GO — gate obligatorio CI

### **GO CONDICIONAL**

**GO** para tratar P0 como **bloqueante cuando los 7 secrets están presentes** (comportamiento actual post-PQ-01, con artefactos).

**NO GO** para declarar gate **obligatorio always-on** (fallar si faltan secrets) hasta:

1. Secrets garantizados en el repo protegido (no forks).  
2. Política explícita de branch protection.  
3. Mitigación o exclusión documentada de **P0-4 Payku** (Tier C / seed dedicado).

---

## 8. Certificación PQ-01

| Criterio | Resultado |
|----------|-----------|
| Solo infra Playwright | **PASS** |
| Sin tests funcionales nuevos | **PASS** |
| Sin negocio / Backend / APIs | **PASS** |
| Artefactos CI | **PASS** |
| Docs | **PASS** |
| Suite apta como gate (condicional) | **PASS** |

### **PASS — PQ-01 Playwright P0 Hardening**

**STOP.** Esperar autorización explícita para **PQ-09**.
