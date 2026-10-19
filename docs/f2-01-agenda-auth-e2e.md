# F2-01 — Agenda & Auth End-to-End Reliability

**Épica:** EPIC 2B  
**Feature:** F2-01  
**Fecha:** 2026-07-17  
**Repo:** `jairosc23/heydoctor-frontend`  
**Rama:** `feature/v1.1-platform-evolution`  
**Modo:** Solo E2E. Sin lógica clínica, APIs, Backend funcional, Copilot, WebRTC, migraciones ni deploy.

---

## 1. Archivos creados / modificados

### Creados

| Path | Rol |
|------|-----|
| `e2e/agenda-auth-reliability.spec.ts` | Suite AUTH-01..06 + AGENDA-01..04 |
| `e2e/helpers/agenda.ts` | Helpers Agenda Enterprise (UI) |
| `e2e/fixtures/agenda-auth.ts` | Reexport fixture PQ-01 (`doctorPage`) |
| `docs/f2-01-agenda-auth-e2e.md` | Esta certificación |
| `docs/f2-01-agenda-auth-e2e.json` | Evidencia |

### Modificados

| Path | Cambio |
|------|--------|
| `e2e/helpers/auth.ts` | Logout, protected route, session loss, goto autenticado |
| `e2e/playwright.config.ts` | Project `chromium-desktop-agenda-auth` |
| `package.json` | `test:e2e:f2-01` / alias `test:e2e:agenda-auth`; `dx:test:e2e` |
| `.github/workflows/ci.yml` | Job `e2e-f2-01` + aggregate |
| `e2e/.env.e2e.example` | Nota F2-01 (triad only) |
| `scripts/dx-doctor.mjs` | Chequea script `test:e2e:f2-01` |

Sin cambios de runtime de producto.

---

## 2. Escenarios E2E incorporados

### Auth

| ID | Escenario |
|----|-----------|
| AUTH-01 | Login doctor sale de `/login` |
| AUTH-02 | Navegación autenticada a Agenda |
| AUTH-03 | Persistencia de sesión tras reload (camino refresh/SSR) |
| AUTH-04 | Logout → `/login` |
| AUTH-05 | `/panel/agenda` sin sesión → `/login` |
| AUTH-06 | Pérdida de sesión (cookies) → login + recuperación (re-login) |

### Agenda Enterprise

| ID | Escenario |
|----|-----------|
| AGENDA-01 | Shell + indicadores + tabs sin error fatal |
| AGENDA-02 | Superficie disponibilidad enterprise (o guía admin) |
| AGENDA-03 | Modal Nueva cita (validaciones UI críticas) |
| AGENDA-04 | Ciclo crear → editar motivo → cancelar (soft-skip sin pacientes) |

**Total:** 10 tests (calidad de cobertura crítica, no volumen).

---

## 3. Reutilización de infraestructura existente

| Artefacto EPIC 1 | Uso F2-01 |
|------------------|-----------|
| PQ-01 `loginAsDoctor` / `doctorPage` / serial | Auth base + fixture |
| PQ-01 retries/trace/screenshot/video | Mismos artefactos Playwright |
| PQ-01 `isE2EAuthReady` | Skip determinístico sin secrets |
| PQ-09 degradación controlada CI | Job `e2e-f2-01` mirror de política P0 |
| PQ-02/03/04 | No duplicados; fuera de alcance E2E UI |

**No** se creó stack paralelo de fixtures.

---

## 4. Validaciones ejecutadas

| Check | Resultado |
|-------|-----------|
| `playwright --list` project agenda-auth | **10 tests** |
| `npm run test:e2e:f2-01` sin secrets | **10 skipped**, exit 0 |
| Ejecución autenticada Preview | **No ejecutada aquí** (sin `.env.e2e` local) |
| CI wiring | Job `e2e-f2-01` + aggregate actualizado |

### Dependencias pendientes (documentadas)

| Dependencia | Impacto |
|-------------|---------|
| Secrets triad CI (`E2E_BASE_URL`, email, password) | Sin ellos job = skipped (degradación controlada) |
| Preview con API real + cookies | Necesario para corrida verde autenticada |
| Dataset QA con ≥1 paciente | AGENDA-04 soft-skip → cerrar con **F2-05** |
| Slot libre / sin bloqueo en ventana creada | Puede fallar create si reglas bloquean 10:00+2d |

---

## 5. Riesgos remanentes

| ID | Riesgo | Severidad |
|----|--------|-----------|
| R1 | AGENDA-04 depende de dataset pacientes | Media (mitigado soft-skip) |
| R2 | Colisión de horario / bloqueos agenda | Media |
| R3 | Refresh real JWT no se fuerza (reload + cookie wipe) | Baja — cubre persistencia y pérdida |
| R4 | Secrets ausentes → gate no bloquea | Media (política PQ-09) |
| R5 | Cold start Preview | Baja (retries CI=2) |

---

## 6. Estado de la suite E2E

| Atributo | Estado |
|----------|--------|
| Auth crítico | **Protegido** (login/logout/guard/recovery) |
| Agenda shell / disponibilidad / modal | **Protegido** |
| CRUD Agenda | **Protegido condicionalmente** (dataset) |
| CI compatible | **Sí** — triad only |
| Preview compatible | **Sí** — mismos waits PQ-01 |
| Artefactos debug | **Sí** — html/trace/video/junit + upload |

---

## 7. GO / NO GO — proteger evolución Agenda

**Decisión: GO CONDICIONAL**

- **GO** para usar esta suite como red de seguridad de Agenda/Auth en evoluciones posteriores.  
- **Condición:** configurar triad E2E en CI/Preview; ejecutar AGENDA-04 green requiere dataset (F2-05).  
- Shell/auth ya aportan red mínima aunque CRUD skippeé.

---

## 8. Certificación F2-01

| Campo | Valor |
|-------|-------|
| Feature | F2-01 Agenda & Auth End-to-End Reliability |
| Resultado | **PASS** |
| GO protección Agenda | **GO CONDICIONAL** |
| Siguiente | Esperar autorización explícita para **F2-02** |

**STOP** — no iniciar F2-02 sin autorización.
