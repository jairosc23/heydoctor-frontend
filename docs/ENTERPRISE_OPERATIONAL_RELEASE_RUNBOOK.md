# Enterprise Operational Release Runbook — HeyDoctor

**Versión:** 1.0 (Enterprise)  
**Estado:** Procedimiento oficial de release  
**Fase:** Validación operativa post-implementación (Preview Release)

---

## Alcance y modelo de despliegue

Esta validación se ejecuta en:

| Capa | Entorno | Rol |
|------|---------|-----|
| **Frontend** | **Vercel Preview** (`https://*.vercel.app`) | Superficie bajo prueba |
| **Backend** | **Production Backend API** (`https://pro-api.heydoctor.health`) | Solo API / datos durante Preview |

**Importante:**

- El backend de producción se usa **únicamente como API** mientras se valida un Vercel Preview.
- **Esto NO es un despliegue a producción** del frontend ni un release de backend.
- **Production** en Vercel (`heydoctor.health`) **no se promueve** hasta completar este runbook con decisión **GO**.

**Prerrequisitos**

- Rama con release candidate (fix CSP P0 + enterprise middleware incluidos)
- Acceso: Vercel (`heydoctor-frontend`), Railway (lectura backend prod), credenciales QA en 1Password/ticket
- Navegador Chrome/Edge + DevTools
- Opcional: Playwright local con `.env.e2e` apuntando al Preview URL

---

## Clasificación de severidad

| Nivel | Áreas | Criterio de bloqueo |
|-------|-------|---------------------|
| **P0** | Authentication, CSP, Clinical Workspace, Payments | Cualquier FAIL = **NO-GO** automático |
| **P1** | Admin, Analytics, Growth, SEO | FAIL = NO-GO para release enterprise; puede documentarse waiver explícito de PM |
| **P2** | Warnings no bloqueantes | Documentar; no bloquean GO si P0/P1 PASS |

---

## 1. Variables de entorno requeridas

### 1.1 Vercel Preview (frontend) — obligatorias

| Variable | Valor | Scope | Notas |
|----------|-------|-------|-------|
| `NEXT_PUBLIC_HEYDOCTOR_API_URL` | `https://pro-api.heydoctor.health` | **Preview** | Obligatoria en build prod |
| `NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE` | `1` | **Preview** | Clinical Action Workspace |
| `NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE` | `1` | **Preview** | Smart Clinical Workspace |
| `NODE_ENV` | `production` | (automático Vercel) | — |

### 1.2 Vercel Preview — recomendadas

| Variable | Valor | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | URL exacta del Preview | Preview |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN proyecto | Preview |
| `NEXT_PUBLIC_SENTRY_RELEASE` | `$VERCEL_GIT_COMMIT_SHA` | Preview |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Valor prod (si aplica) | Preview |

**No definir** `DISABLE_ENTERPRISE_MIDDLEWARE` en validación normal (solo rollback de emergencia).

### 1.3 Railway backend (producción) — verificar, no desplegar

| Variable | Estado esperado |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `BACKEND_PUBLIC_URL` | `https://pro-api.heydoctor.health` |
| `JWT_SECRET` | Configurado (no rotar durante QA) |
| `PAYKU_API_KEY` | Configurado |
| `PAYKU_CONSULTATION_PAYMENTS_DISABLED` | `false` o unset |
| `ALLOW_FAKE_PAYMENTS` | `false` |
| `OPENAI_API_KEY` | Configurado (AI Assistant) |
| `REDIS_URL` | Configurado (si aplica WebRTC/signaling) |

**Condicional (solo si falla retorno Payku):** `FRONTEND_URL` → URL Preview temporal; **revertir** al terminar QA.

### 1.4 Variables locales E2E (operador)

| Variable | Uso |
|----------|-----|
| `E2E_BASE_URL` | URL Preview (sin `/` final) |
| `E2E_DOCTOR_EMAIL` / `E2E_DOCTOR_PASSWORD` | Cuenta médico QA en prod DB |
| `E2E_CONSULTATION_HTA` | UUID consulta HTA |
| `E2E_CONSULTATION_PAYMENT` | UUID consulta firmada para Payku |
| `E2E_GUEST_TOKEN` | `publicToken` teleconsulta invitado |

---

## 2. Configuración Vercel Preview

| # | Paso | Verificación |
|---|------|--------------|
| 1 | Proyecto `heydoctor-frontend` → rama release candidate | Deployment Preview activo |
| 2 | Environment Variables → scope **Preview** únicamente | API URL + flags workspace |
| 3 | Redeploy Preview (**no** Production) | Build exitoso |
| 4 | Copiar URL Preview | `/` responde sin 5xx |
| 5 | Confirmar Production sin cambios no autorizados | Prod intacta |

**Smoke post-deploy:**

```bash
curl -sI "https://<preview>.vercel.app/" | grep -i content-security-policy
```

Debe existir CSP con `'nonce-…'` y `'strict-dynamic'`.

---

## 3. Configuración Railway backend

| # | Verificación | PASS |
|---|--------------|------|
| 1 | Servicio backend prod **Running** | Health estable |
| 2 | `GET /api/auth/csrf` con `Origin: https://<preview>.vercel.app` | CORS allow presente |
| 3 | Logs sin spike `origin_blocked` | Sin bloqueos CORS |
| 4 | Payku habilitado | Checkout no deshabilitado |
| 5 | **No** ejecutar `seed:e2e` en DB prod sin aprobación | Sin contaminación |

**CORS:** producción permite `https://*.vercel.app` además de dominios HeyDoctor canónicos.

---

## 4. Cuentas de prueba requeridas

| Rol | Propósito | Notas |
|-----|-----------|-------|
| **Doctor** | Login, panel, consultas, teleconsulta host, AI, documentos | Cuenta médico **real en prod** (ticket QA). Seed `e2e.ci.doctor@heydoctor.local` solo si existe en DB |
| **Admin** | `/admin/*`, analytics, ops, growth | `role=admin` en prod |
| **Paciente / Guest** | Teleconsulta invitado | **Sin login** — validar vía `/teleconsulta/invitado/[token]` |

**Artefactos de consulta (ticket QA):**

| Artefacto | Uso |
|-----------|-----|
| `CONSULTATION_HTA` | Clinical Workspace visual |
| `CONSULTATION_PAYMENT` | Flujo Payku |
| `GUEST_TOKEN` | Teleconsulta invitado |
| `CONSULTATION_ID` | `/panel/consultas/[id]` |

---

## 5. Secuencia de validación manual

Registrar: operador, fecha, Preview URL, commit SHA, resultado PASS/FAIL.

---

### 5.1 Login — **P0 · Authentication**

| Paso | Acción |
|------|--------|
| 1 | Ventana limpia → `https://<preview>/login` |
| 2 | Credenciales doctor QA → submit |

**PASS:** redirect a `/panel` (o destino `?redirect=`); sin error CORS/red.  
**FAIL:** permanece en login, pantalla en blanco, 401 persistente.

---

### 5.2 Refresh — **P0 · Authentication**

| Paso | Acción |
|------|--------|
| 1 | Confirmar cookie `heydoctor_session` HttpOnly |
| 2 | Recarga dura + navegación entre rutas panel |
| 3 | Esperar ventana de silent refresh (~60s) si aplica |

**PASS:** sesión persiste; cookie válida; sin logout silencioso.  
**FAIL:** redirect inesperado a login; cookie ausente.

---

### 5.3 Logout — **P0 · Authentication**

| Paso | Acción |
|------|--------|
| 1 | Cerrar sesión desde UI |
| 2 | Abrir `/panel` |

**PASS:** redirect a `/login`; cookie eliminada; `DELETE /api/auth/session` OK.  
**FAIL:** panel accesible sin sesión.

---

### 5.4 Rutas protegidas — **P0 · Authentication**

| Ruta | Sin sesión | Con sesión |
|------|------------|------------|
| `/panel` | → login | 200 |
| `/panel/consultas/[id]` | → login | 200 |
| `/admin/analytics` | → login | 200 |
| `/payment-success` | → login | 200 |
| `/teleconsulta/[id]` | → login | 200 host |

**PASS:** guards SSR coherentes; sin loops redirect.  
**FAIL:** loop login ↔ panel; 403 con sesión válida.

---

### 5.5 Flujo de pago — **P0 · Payments**

#### A — Consulta clínica (Payku desde panel)

| Paso | Acción |
|------|--------|
| 1 | `/panel/consultas/{CONSULTATION_PAYMENT}` — estado **firmada** |
| 2 | Pagar → confirmar |

**PASS mínimo (sandbox no disponible):**

- [ ] Sesión de checkout creada (`create-payment-session` → 200/201)
- [ ] Redirect a dominio Payku (`*.payku.cl` o URL documentada)
- [ ] URL de callback/retorno apunta al **Preview URL** correcto (o dominio documentado en ticket)

**PASS completo (sandbox disponible — opcional):**

- [ ] Pago sandbox completado
- [ ] Retorno sin loop
- [ ] Consulta pasa a pagada/bloqueada en UI

**FAIL:** error al crear sesión; redirect roto; callback URL incorrecta; loop post-retorno.

#### B — Plan PRO (`/pricing` → `/payment-success`)

| Paso | Acción |
|------|--------|
| 1 | Login → `/pricing` → CTA upgrade |
| 2 | Validar checkout (mínimo: creación + redirect + callback) |
| 3 | Si sandbox OK: completar → `/payment-success` |

**PASS mínimo:** checkout creado, redirect Payku, callback URL correcta.  
**PASS completo:** “PRO Activado” o pending documentado; `plan: pro` en `/auth/me`.  
**FAIL:** loop; plan no sincroniza tras reintentos (solo aplica si pago completado).

---

### 5.6 Telemedicina host — **P0 · Telemedicine**

| Paso | Acción |
|------|--------|
| 1 | Login doctor → consulta con teleconsulta |
| 2 | Abrir sala host (`/panel/consultas/[id]/teleconsulta` o flujo UI) |
| 3 | Permisos cámara/micrófono |

**PASS:** sala carga; signaling conecta; preview local visible; sin CSP block.  
**FAIL:** gate bloqueado con sesión; WS/CORS fallido.

---

### 5.7 Telemedicina invitado — **P0 · Telemedicine**

| Paso | Acción |
|------|--------|
| 1 | Incógnito sin login |
| 2 | `/teleconsulta/invitado/{GUEST_TOKEN}` |

**PASS:** **no** redirect a `/login`; gate invitado carga; token inválido → error controlado (no 500).  
**FAIL:** middleware fuerza login; scripts CSP bloqueados.

---

### 5.8 Clinical Workspace — **P0 · Clinical Workspace**

Abrir `/panel/consultas/{CONSULTATION_HTA}`.

**Verificación técnica (atributos):**

- `data-clinical-action-workspace="true"`
- `data-columns="1"` (ADR-019 — columna clínica unificada; Action WS ON)

**Verificación visual obligatoria:**

| Componente | Qué confirmar |
|------------|---------------|
| **Header** | Barra de contexto del paciente visible, sticky al scroll, identidad y estado clínico legibles |
| **Timeline** | Línea temporal / eventos clínicos visible y navegable |
| **Patient Rail** | Rail lateral de paciente (navegación clínica) visible en desktop |
| **Encounter** | Secciones de ficha (SOAP / encounter sections) renderizadas y scrollables |
| **Copilot** | Panel o entry point Copilot accesible desde la ficha |

**PASS:** los cinco componentes visibles y usables; layout 2-col; sin banner legacy 1-col.  
**FAIL:** cualquier componente ausente, colapsado irrecuperable, o flags OFF en build.

---

### 5.9 AI Assistant — **P0 · Clinical Workspace / AI**

| Paso | Acción |
|------|--------|
| 1 | En consulta activa, abrir Copilot / Asistente IA |
| 2 | Ejecutar acción mínima (sugerencia, análisis, o prompt corto) |
| 3 | Observar DevTools Console |

**PASS funcional (todos):**

- [ ] **No** infinite loading (spinner termina ≤ 30s)
- [ ] **No** timeout de red sin mensaje de error
- [ ] **Respuesta útil** devuelta (texto clínico, sugerencia o estado vacío documentado — no payload roto)
- [ ] **Cero errores de aplicación** en consola durante el flujo AI

**FAIL:** loading infinito; timeout silencioso; respuesta vacía/error 500; errores JS en consola.

---

### 5.10 Documentos — **P0 · Clinical Workspace**

| Paso | Acción |
|------|--------|
| 1 | Consulta firmada → módulo Documentos |
| 2 | Generar / previsualizar documento |
| 3 | Verificar gates post-firma |

**PASS:** sheet abre; generación OK; lock post-pago respetado.  
**FAIL:** 403, PDF vacío, edición tras lock.

---

### 5.11 Admin — **P1 · Admin**

| Paso | Acción |
|------|--------|
| 1 | Login admin → `/admin/analytics` |
| 2 | Navegar: subscriptions, ops, growth |

**PASS:** rutas 200; charts/tablas cargan; APIs admin no 403.  
**FAIL:** 403 sistemático; charts rotos.

---

### 5.12 Analytics / Growth — **P1**

| Área | Validación |
|------|------------|
| **Analytics** | `/admin/analytics` carga; sin errores fetch core |
| **Growth** | `/admin/growth` carga; beacon/eventos no bloqueados por CSP |
| **SEO** | `/`, `/pricing`: `<title>`, OG tags, `/sitemap.xml` accesible |

**PASS:** superficies cargan; metadata presente.  
**FAIL:** errores de aplicación en consola; metadata ausente en rutas indexables.

---

### 5.13 CSP — **P0 · CSP**

| Paso | Acción |
|------|--------|
| 1 | Network → documento HTML en `/`, `/login`, `/panel`, `/demo/interactive` |
| 2 | Header `Content-Security-Policy`: `nonce-` + `strict-dynamic` |
| 3 | Todos los `<script>` del documento inicial con `nonce` coincidente |
| 4 | Console → filtrar `securitypolicyviolation` |

**PASS:** nonce alineado misma petición; cero violations; app interactiva.  
**FAIL:** scripts sin nonce; violations; UI muerta.

---

### 5.14 Browser / Consola — **P0 (aplicación) · P2 (terceros)**

**Requisito:** **cero errores de aplicación HeyDoctor**.

**Incluir (bloquean GO):**

- Errores CSP / scripts bloqueados
- Hydration mismatches
- `TypeError: Failed to fetch` en login, panel, consultas, AI, pagos
- Uncaught exceptions en código HeyDoctor / Next.js de la app

**Ignorar (P2 — no bloquean GO):**

- Extensiones del navegador (AdBlock, password managers, etc.)
- Warnings de terceros fuera del control HeyDoctor (p. ej. analytics externos, fonts CDN warnings benignos)
- Deprecations del navegador no relacionadas con la app

Recorrer: `/`, `/pricing`, `/login`, `/panel`, `/panel/consultas/[id]`, `/admin/analytics`, `/demo/interactive`, guest URL.

**PASS:** cero errores de aplicación en todas las rutas críticas.  
**FAIL:** cualquier error de aplicación bloqueante en rutas P0.

---

## 6. Criterios Pass/Fail globales

| ID | Severidad | Área | PASS | FAIL |
|----|-----------|------|------|------|
| G1 | P0 | Deploy Preview | Build OK, app carga | 5xx, build fallido |
| G2 | P0 | CORS / API | Auth y panel sin CORS | `origin_blocked`, fetch auth fallido |
| G3 | P0 | Authentication | Login + refresh + logout + redirect | Sesión inconsistente |
| G4 | P0 | CSP | Nonce alineado, 0 violations | Scripts bloqueados |
| G5 | P0 | Clinical Workspace | Visual + técnico PASS | Componentes ausentes / flags OFF |
| G6 | P0 | Payments | Checkout + redirect + callback (mínimo) | Sesión/redirect/callback roto |
| G7 | P0 | Telemedicine | Host + guest público | Guest detrás de login |
| G8 | P0 | AI Assistant | Respuesta útil, sin loading infinito | Timeout / error / consola rota |
| G9 | P1 | Admin / Analytics / Growth / SEO | Superficies P1 operativas | 403 / metadata rota |
| G10 | P2 | Warnings terceros | Documentados | — (no bloquean) |

**Decisión GO Production:** todos los ítems **P0** PASS + P1 PASS (o waiver PM documentado).

---

## 7. Procedimiento de rollback

### 7.1 Falla en Preview (antes de promover Production)

| # | Acción |
|---|--------|
| 1 | **No promover** Preview → Production |
| 2 | Vercel → redeploy deployment anterior estable |
| 3 | Revertir variables Preview erróneas → redeploy |
| 4 | Documentar SHA + síntoma |

### 7.2 Si se modificó `FRONTEND_URL` en Railway

Restaurar valor prod canónico (`https://heydoctor.health` o documentado) → redeploy backend si aplica.

### 7.3 Emergencia en Production (solo si ya se promovió)

| Escalón | Acción | Impacto |
|---------|--------|---------|
| **E1** | Vercel Production → rollback deployment anterior | Bajo |
| **E2** | `DISABLE_ENTERPRISE_MIDDLEWARE=1` (temporal, aprobación Ops) | **Alto** — desactiva CSP + auth SSR edge |
| **E3** | Revert commit + redeploy | Medio |

**Orden:** E1 → E2 (solo incidente) → E3.

### 7.4 Rollback inmediato si

- Landing/login sin JavaScript (CSP)
- Loop login ↔ panel
- Checkout roto (sin sesión Payku)
- Guest teleconsulta detrás de auth
- Spike 5xx correlacionado al release

### 7.5 Evidencia post-rollback

- [ ] Dominio canónico carga `/` y `/login`
- [ ] CSP presente (si middleware activo)
- [ ] Login doctor funciona
- [ ] Ticket incidente cerrado

---

## 8. Enterprise Release Checklist

Completar antes de promover **Vercel Preview → Production**.

```
Enterprise Release Validation Record
────────────────────────────────────
Preview URL:     _________________________________
Commit SHA:      _________________________________
Backend API:     https://pro-api.heydoctor.health (API only — NOT prod deploy)
Operador:        _________________________________
Fecha:           _________________________________

Automated gates (CI / local)
□ Build PASS
□ Lint PASS
□ Typecheck PASS
□ Unit Tests PASS
□ E2E PASS                    (Preview URL + credenciales QA)

P0 — Release blockers
□ CSP PASS
□ Authentication PASS
□ Clinical Workspace PASS
□ AI Assistant PASS
□ Telemedicine PASS
□ Payments PASS               (mínimo: checkout + redirect + callback)

P1 — Enterprise surfaces
□ Admin PASS
□ Browser PASS                (cero errores de aplicación; ignorar extensiones/terceros)

Operational readiness
□ Rollback validated
□ Ready for Production

Decisión final:   GO  /  NO-GO
Notas: _________________________________________________
```

---

## Referencias

- `e2e/README.md` — Playwright P0 clínico
- `e2e/.env.e2e.example` — plantilla credenciales Preview
- `docs/PHASE_4.9.2_GO_LIVE_PREPARATION.md` — preparación GO-LIVE
- `docs/RELEASE_POLICY.md` — política SemVer y tags

---

*Documento oficial — HeyDoctor Enterprise Operational Release. No sustituye aprobación PM/Ops para uso de DB prod o cambios Railway.*
