# Frontend Roadmap — HeyDoctor

**Repositorio:** `jairosc23/heydoctor-frontend`  
**Estado del documento:** Aprobado — referencia estratégica permanente  
**Última revisión:** 2026-07-04  
**Base de referencia:** `main` post Fase 18 (`b6a9b6ff`)

---

## Visión general del roadmap

Este documento consolida el inventario estratégico aprobado del frontend HeyDoctor. Su propósito es servir como **fuente de verdad para la planificación de fases futuras**, sin prescribir implementación, ramas Git ni calendarios de entrega.

### Principios rectores

1. **Repositorio SSOT:** todo el trabajo de UI vive en `jairosc23/heydoctor-frontend`. Los repositorios donor son read-only (ver `docs/FRONTEND_SSOT.md`).
2. **`main` como rama de integración estable:** el desarrollo funcional ocurre en ramas `feature/*` con PR obligatorio, Conventional Commits y gates CI (`lint`, `typecheck`, `build`).
3. **Fases acotadas:** cada fase tiene charter explícito, alcance delimitado y criterios de cierre verificables.
4. **Congelamiento post-cierre:** las fases cerradas (p. ej. Fase 18 Branding SSOT) no se modifican salvo nueva decisión de diseño.
5. **Priorización por valor y riesgo:** release readiness y seguridad preceden a features especulativas.

### Alcance del frontend

Landing pública · Branding · Panel clínico · Telemedicina · IA clínica · Pricing · Demo · Admin · SEO · Componentes compartidos.

### Escala de esfuerzo

| Símbolo | Significado |
|---|---|
| **S** | 1–5 días |
| **M** | 1–2 semanas |
| **L** | 2–4 semanas |
| **XL** | 1+ mes |

---

## Categorías estratégicas

El roadmap agrupa las iniciativas en trece categorías. Cada iniciativa tiene identificador único (`S1`, `P1`, `A1`, etc.) para trazabilidad en fases futuras.

| # | Categoría | Enfoque |
|---|---|---|
| 1 | Seguridad y hardening | CSP, middleware, auth, CSRF, RBAC, perímetro Edge |
| 2 | Performance y Core Web Vitals | LCP, INP, CLS, imágenes, bundle, renderizado |
| 3 | Accesibilidad (WCAG 2.2 AA) | Skip links, teclado, contraste, tests automatizados |
| 4 | SEO técnico | Sitemap, robots, metadata, OG, structured data |
| 5 | Observabilidad | Sentry, logging clínico, analytics, métricas WebRTC |
| 6 | Testing | Unitario, integración, E2E, visual regression |
| 7 | Plataforma clínica | Workspace, foundation, encounter, agenda, cierre |
| 8 | Telemedicina | WebRTC, signaling, guest flows, resiliencia |
| 9 | IA clínica | Copilot, facade, governance generativa, intelligence |
| 10 | Marketplace | Pricing, directorio médico, captación, transaccional |
| 11 | Panel administrativo | Analytics, ops, growth, subscriptions |
| 12 | Experiencia móvil / PWA | Manifest, workspace móvil, responsive, offline |
| 13 | Documentación técnica | SSOT docs, README, GO-LIVE evidence, CONTRIBUTING |

---

## Priorización

### Resumen por nivel

| Prioridad | Iniciativas | Temas dominantes |
|---|---|---|
| **Alta** | 14 | GO-LIVE operacional, workspace prod, seguridad admin/CSP, E2E bloqueante, observabilidad prod, mobile workspace |
| **Media** | 18 | Performance/CWV, WCAG, SEO dinámico, IA refinada, telemedicina E2E, docs, foundation API |
| **Baja** | 10 | Marketplace transaccional, PWA offline, visual regression formal, ADR index, cleanup ramas |

### Top 10 — candidatas para decisión de roadmap

Orden sugerido para discusión conjunta. **No implica numeración de fases.**

| Rank | ID | Iniciativa | Prioridad |
|---|---|---|---|
| 1 | S1 | Validación Enterprise Preview Release | Alta |
| 2 | T2 | Evidencia E2E GO-LIVE (gl-07–gl-11) | Alta |
| 3 | C1 | Activación workspace flags en prod | Alta |
| 4 | T1 | E2E P0 bloqueante en CI | Alta |
| 5 | S2 | RBAC admin en Edge | Alta |
| 6 | C5 | Close Flow Wizard producción | Alta |
| 7 | O2 | Sentry obligatorio en prod | Alta |
| 8 | M2 | Mobile Consultation Workspace parity | Alta |
| 9 | AI3 | Governance generative copilot | Alta |
| 10 | D4 | Cierre evidencia GO-LIVE docs | Alta |

---

## Dependencias

### Cadena crítica (release readiness)

```
S1 (Preview Release Validation)
  └─ T2 (GO-LIVE E2E Evidence)
       └─ T4 (E2E Workspace 2-col)
            └─ C1 (Workspace Flags Prod)
                 └─ C2 (Prod vs Auditado Parity)
```

### Dependencias transversales

| Iniciativa | Depende de | Habilita |
|---|---|---|
| S2 (RBAC admin Edge) | Claims JWT estables en backend | T7 (E2E admin) |
| C3 (Clinical Foundation API) | Endpoints backend foundation | C4 (Encounter Intelligence) |
| C7 (Professional Profile) | API Nest profile | MK3 (Directorio `/dr/[slug]`) |
| O2 (Sentry prod) | DSN configurado en Vercel | O3 (Clinical logger wire) |
| A1 (WCAG baseline) | — | A4 (Mobile workspace a11y) |
| D4 (GO-LIVE docs) | S1, T2 | Decisión GO operacional |

### Restricciones de congelamiento

- **Fase 18 (Branding SSOT):** iniciativas P2 (imágenes) y M3 (landing responsive) deben respetar el asset congelado en `public/brand/heydoctor-icon.svg` y el flujo `BrandLogo` → `BrandMarkProvider`. Ver [`branding-ssot.md`](./branding-ssot.md).

---

## Criterios para definir futuras fases

Una fase futura debe definirse explícitamente antes de iniciar desarrollo. Este documento **no asigna** iniciativas a números de fase.

### Requisitos para charter de fase

| Criterio | Descripción |
|---|---|
| **Objetivo único** | Una frase clara del resultado esperado |
| **Alcance delimitado** | Lista de iniciativas incluidas (IDs de este documento) |
| **Exclusiones explícitas** | Qué no se tocará (p. ej. Branding SSOT congelado) |
| **Dependencias resueltas** | Prerrequisitos backend, ops o fases anteriores |
| **Criterios de aceptación** | Verificables: tests, evidencia ops, auditoría |
| **Flujo Git** | Rama `feature/phase-N-<alcance>` → PR → merge a `main` |
| **Validaciones obligatorias** | `npm run lint`, `npm run typecheck`, `npm run build` (+ tests/E2E según alcance) |

### Tipos de fase reconocidos

| Tipo | Ejemplo | Cuándo usar |
|---|---|---|
| **Producto** | Encounter intelligence, agenda enterprise | Valor clínico directo |
| **Plataforma** | RBAC Edge, E2E CI gate | Hardening transversal |
| **Operacional** | Preview release validation, GO-LIVE evidence | Release readiness |
| **Mantenimiento** | Versionado docs SSOT, limpieza ramas | Deuda técnica organizacional |

### Reglas de selección

1. No mezclar tipos incompatibles en una misma fase (p. ej. GO-LIVE ops + marketplace transaccional).
2. Preferir fases entregables en **1–3 semanas** de esfuerzo neto.
3. Las iniciativas **Alta** de release readiness (S1, T2, C1) deben evaluarse antes de features especulativas **Baja** (MK4, M4).
4. Toda fase nueva debe declarar impacto sobre Branding SSOT (Fase 18).

---

## Estado de Fase 18 (cerrada)

| Campo | Valor |
|---|---|
| **Nombre** | Branding SSOT |
| **Estado** | ✅ Cerrada y aprobada |
| **Commit de cierre** | `b6a9b6ff` — `feat(branding): finalize Branding SSOT architecture and visual consistency` |
| **Documentación** | [`branding-ssot.md`](./branding-ssot.md) |
| **Asset oficial** | `public/brand/heydoctor-icon.svg` |
| **Color corporativo** | `#078A92` |
| **Flujo SSOT** | `BrandLogo` → `BrandMarkProvider` → `useBrandMarkSrc()` → `getBrandMarkSrc()` |

### Regla post-cierre

Cualquier modificación al isotipo, wordmark o flujo de resolución del logo debe tratarse como **nueva decisión de diseño**, no como corrección técnica. Ver restricciones en `branding-ssot.md`.

---

## Lista de iniciativas pendientes

### 1. Seguridad y hardening

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| S1 | Validación Enterprise Preview Release | Ejecutar checklist P0 del runbook contra Vercel Preview | Confirma CSP, middleware, auth y workspace en condiciones reales | Regresiones sin detección en prod | Vercel Preview, credenciales QA, backend prod | M | **Alta** |
| S2 | RBAC admin en Edge | Verificar rol `ADMIN` en middleware para `/admin/*` | Cierra bypass con token de rol no-admin | Cambios en redirects auth | Claims JWT backend | S | **Alta** |
| S3 | Endurecimiento CSP `style-src` | Reducir `'unsafe-inline'` en estilos | Postura XSS auditable | Romper estilos globales | Auditoría CSS/Tailwind | L | Media |
| S4 | Validación firma JWT SSR | Evaluar verificación criptográfica vs solo `exp` | Reduce tokens manipulados | Complejidad Edge | Backend auth, JWKS | M | Media |
| S5 | Eliminar escape hatches prod | Auditar `DISABLE_ENTERPRISE_MIDDLEWARE` | Evita bypass accidental | Bajo | Acceso Vercel env | S | Media |
| S6 | Auditoría CSRF y auth timeout | Resolver timeouts en bootstrap CSRF | Login/refresh estables | Impacto sesiones activas | Backend `/auth/csrf` | M | **Alta** |

### 2. Performance y Core Web Vitals

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| P1 | Baseline CWV producción | Medir LCP, INP, CLS en rutas críticas | Datos objetivos para optimizar | Ninguno | Speed Insights o RUM | S | **Alta** |
| P2 | Optimización imágenes Next.js | Configurar `images` en `next.config.mjs`; usar `next/image` | Mejora LCP | Regresión visual BrandLogo (SSOT) | Política Fase 18 | M | Media |
| P3 | Renderizado selectivo | Reevaluar `connection()` global; rutas estáticas donde sea seguro | Reduce TTFB y compute | Reintroducir bug CSP P0 | Validación CSP, E2E | L | Media |
| P4 | Bundle analysis | Analizar chunks panel/admin; ampliar `dynamic()` | Mejora INP first load | Refactor encounter extenso | Bundle analyzer | M | Media |
| P5 | Speed Insights | Integrar `@vercel/speed-insights` | Monitoreo CWV continuo | Bajo | Deploy Vercel | S | Baja |

### 3. Accesibilidad (WCAG 2.2 AA)

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| A1 | Auditoría WCAG baseline | Evaluar contraste, teclado, focus, labels en rutas P0 | Mapa de gaps accionable | Ninguno | axe/Lighthouse | S | **Alta** |
| A2 | Skip links y landmarks | Skip-to-content + landmarks semánticos | Cumple 2.4.1 Bypass Blocks | Bajo | Layout raíz | S | Media |
| A3 | Suite a11y automatizada | `jest-axe` o Playwright axe en CI | Regresiones en PR | Falsos positivos clínicos | Infra testing | M | Media |
| A4 | A11y workspace móvil | Validar tabs móviles, copilot, SOAP con lectores pantalla | Paridad desktop/mobile | Focus trap sensible | A1 | M | Media |
| A5 | Patrones a11y documentados | Guía interna focus/aria/forms | Consistencia futura | Ninguno | Design tokens | S | Baja |

### 4. SEO técnico

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| SEO1 | Sitemap dinámico ampliado | Incluir `/dr/[slug]`, `/doctors/[id]` | Descubrimiento perfiles médicos | Fetch slugs en build | API backend | M | Media |
| SEO2 | `lastModified` real | Fechas reales en sitemap | Señales frescura correctas | Bajo | Backend metadata | S | Baja |
| SEO3 | Metadata por ruta pública | Extender patrón pricing a rutas públicas | OG/canonical consistentes | Duplicación | `lib/seo.ts` | M | Media |
| SEO4 | Structured data JSON-LD | Schema MedicalBusiness, Physician | Rich results | Validación schema.org | Legal/compliance | M | Baja |
| SEO5 | Auditoría indexación | Confirmar robots disallow completo | Evita indexación PHI | Bajo | Inventario rutas | S | Media |

### 5. Observabilidad

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| O1 | Monitoreo post-GO-LIVE 24h | Ventana Sentry post-promoción (gl-18) | Detección temprana incidentes | Requiere promoción previa | Sentry prod | S | **Alta** |
| O2 | Sentry obligatorio prod | DSN en prod/preview + alertas | Trazabilidad errores | Coste; PHI si redacción falla | `sentry-redaction.ts` | S | **Alta** |
| O3 | Clinical logger → Sentry | Conectar `dispatchToObservability` | Errores clínicos visibles | Ruido/PHI | O2 | S | Media |
| O4 | Dashboards WebRTC | Consolidar métricas en vista ops | Diagnóstico videollamadas | Backend persistencia | API Nest, `/admin/ops` | M | Media |
| O5 | Analytics first-party resiliente | Resolver desactivación silenciosa en 404 | Datos growth confiables | Contrato API | Backend analytics | M | Baja |
| O6 | Correlación release ↔ Sentry | `SENTRY_RELEASE=$VERCEL_GIT_COMMIT_SHA` | Triage por commit | Config Vercel | Deploy pipeline | S | Media |

### 6. Testing

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| T1 | E2E P0 bloqueante CI | `clinical-p0.spec.ts` como gate obligatorio | Regresiones bloquean merge | Flaky sin secrets estables | GitHub secrets, QA prod | M | **Alta** |
| T2 | Evidencia GO-LIVE E2E | gl-07–gl-11 documentados | Desbloquea GO operacional | Datos QA prod | Backend, Payku | M | **Alta** |
| T3 | Tests componentes React | Testing Library para UI crítica | Cobertura más allá de `lib/` | Mantenimiento | Infra test runner | L | Media |
| T4 | E2E workspace observability | Validar `data-columns="1"` (ADR-019) y smart workspace ON | CI detecta flags OFF | Env-dependent | T1, env Preview | M | **Alta** |
| T5 | Visual regression pipeline | Formalizar snapshots Playwright en CI | Regresiones UI encounter | Falsos positivos fonts | Storage snapshots | M | Baja |
| T6 | Smoke test real CI | Reemplazar placeholder `ci-smoke.test.mjs` | CI smoke con valor | Bajo | — | S | Media |
| T7 | E2E admin y auth | Specs `/admin/*` y login/refresh | Cobertura enterprise | Credenciales admin | S2, secrets CI | M | Media |

### 7. Plataforma clínica

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| C1 | Activación workspace flags prod | `CLINICAL_ACTION_WORKSPACE=1`, `SMART_CLINICAL_WORKSPACE=1` | Workspace enterprise en prod | Regresión UX sin QA | T2, T4, S1 | M | **Alta** |
| C2 | Paridad prod vs auditado | Cerrar gap layout prod ≠ entorno 4.7 | Lo desplegado = lo validado | Alto impacto encounter | C1 | M | **Alta** |
| C3 | Clinical Foundation API completa | Cliente + tipos + hook unificados | Base datos encounter | Contrato API backend | Backend foundation | M | Media |
| C4 | Encounter Intelligence Layer | Insights/warnings determinísticos en workspace | Valor clínico sin IA autónoma | Ruido UX intelligence | C3, governance 4.7B | L | Media |
| C5 | Close Flow Wizard producción | Cierre consulta con gates pago/firma | Flujo auditable E2E | Gates Payku/backend | Backend payments, T2 | M | **Alta** |
| C6 | Agenda médica enterprise | Madurar `/panel/agenda` con permisos admin | Operación clínica diaria | Trabajo histórico no mergeado | Backend appointments | L | Media |
| C7 | Perfil profesional settings | Completar `/panel/settings/professional-profile` | Datos médico consistentes | Validación backend | API Nest profile | M | Media |

### 8. Telemedicina

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| TM1 | E2E flujo guest | Automatizar `/teleconsulta/invitado/[token]` | Regresiones guest en CI | Tokens efímeros | Backend guest tokens | M | Media |
| TM2 | Resiliencia WebRTC enterprise | ICE fallback, métricas, TURN restrictivos | Menos llamadas fallidas | Negociación SDP sensible | STUN/TURN prod | L | Media |
| TM3 | Grabación teleconsulta | Evaluar `webrtc-recording-api.ts` vs legal | Feature diferenciador | Compliance HIPAA | Legal, backend storage | XL | Baja |
| TM4 | UI mobile videollamada | Optimizar `TeleconsultaVideoSession` móvil | UX telemedicina móvil | Browser quirks WebRTC | TM2 | M | Media |
| TM5 | Chat integrado encounter | Unificar `ChatPanel` con workspace | Comunicación in-consulta | Sync estado consulta | Panel consultas | M | Baja |

### 9. IA clínica

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| AI1 | Reducción ruido intelligence | Calibración H9–H11, FN+5 (Phase 4.7B) | Menos alert fatigue | Sobre-corrección | Docs 4.7B/4.7C | M | Media |
| AI2 | Calibración Quality Score | Ajustar score 0–100 (Phase 4.7D) | Métrica confiable | Gamificación percibida | AI1 | M | Media |
| AI3 | Governance generative copilot | Límites `CopilotGenerativeSection` | IA asistiva compliant | Riesgo regulatorio | Backend guardrails | M | **Alta** |
| AI4 | Cleanup panels deprecados | Eliminar `ConsultationAssistPanel`, `AiInsightsPanel` | Menos deuda | Bajo si desmontados | Confirmar cero imports | S | Baja |
| AI5 | Facade observabilidad | Trazas latencia/error en `clinical-ai-facade.ts` | Debug assist/summary | PHI en logs | O2 | S | Media |
| AI6 | Live AI Notes refinement | Madurar `LiveAiNoteSuggestions` | Productividad SOAP | Sugerencias incorrectas | AI3 | M | Media |

### 10. Marketplace

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| MK1 | Definición producto Marketplace | Decidir pricing vs directorio vs transaccional | Evita desarrollo especulativo | Ninguno | Decisión negocio | S | Media |
| MK2 | Pricing page enterprise | Evolucionar `/pricing` con experimentos growth | Conversión medible | A/B sin tráfico | Backend growth API | M | Media |
| MK3 | Directorio `/dr/[slug]` | Perfiles públicos indexables | SEO + confianza | Datos incompletos | C7, SEO1 | M | Media |
| MK4 | Marketplace transaccional | Catálogo, booking, pagos (no existe) | Nuevo vertical | Scope grande, legal | Backend marketplace | XL | Baja |
| MK5 | For Doctors apply flow | Madurar `/for-doctors/apply` | Captación médicos | Spam solicitudes | `/panel/admin` | M | Baja |

### 11. Panel administrativo

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| AD1 | Unificación superficies admin | Clarificar `/admin/*` vs `/panel/admin` | UX admin coherente | Refactor routing | Decisión producto | M | Media |
| AD2 | Admin Analytics prod-ready | Validar con datos reales, 403 | Ops data-driven | Performance charts | Backend analytics, S2 | M | Media |
| AD3 | Admin Ops dashboard | Consolidar métricas requests/health | Observabilidad interna | Datos sensibles | Backend ops, O4 | M | Media |
| AD4 | Admin Growth experiments | Madurar `/admin/growth` | Control A/B sin deploy | Flags backend | Backend growth | M | Baja |
| AD5 | Subscriptions admin | Completar `/admin/subscriptions` | Revenue ops | Contrato API | Backend billing | L | Baja |

### 12. Experiencia móvil / PWA

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| M1 | Manifest wiring layout | `<link rel="manifest">` en `app/layout.tsx` | PWA installable básica | Bajo | `public/manifest.json` | S | Media |
| M2 | Mobile Workspace parity | Cerrar gaps `MobileConsultationWorkspace` vs desktop | UX consulta móvil/tablet | Cambios UX clínicos | C1, A4 | M | **Alta** |
| M3 | Landing responsive audit | Validar nav mobile post-Fase 18 | Consistencia visual | Solo layout, no SVG SSOT | Branding congelado | S | Media |
| M4 | Service Worker / offline | Workbox cache estático (sin PHI) | Experiencia app-like | Cachear datos clínicos | Seguridad, legal | XL | Baja |
| M5 | Install prompt PWA | `beforeinstallprompt` landing/panel | Retención mobile | Browser heterogéneo | M1 | M | Baja |
| M6 | Panel sidebar mobile | Navegación panel en `< md` | Usabilidad móvil | z-index conflicts | PanelLayout | M | Media |

### 13. Documentación técnica

| ID | Iniciativa | Objetivo | Beneficio | Riesgo | Dependencias | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|---|
| D1 | Versionado Frontend SSOT | Integrar `docs/FRONTEND_SSOT.md` | Política donor visible | Ninguno | Aprobación explícita | S | Media |
| D2 | Actualización README | Alinear con Next 16, rutas reales | Onboarding correcto | Ninguno | — | S | Media |
| D3 | Índice `docs/architecture/` | Enlazar SSOT docs | Navegabilidad | Ninguno | D1 | S | Baja |
| D4 | Cierre evidencia GO-LIVE | 18/18 ítems en PHASE_4.9.3/4.9.4 | Trazabilidad auditable | Ninguno | S1, T2 | M | **Alta** |
| D5 | CONTRIBUTING + PR template | Documentar flujo `feature/*` | Flujo enterprise | Ninguno | Workflow aprobado | S | Media |
| D6 | Limpieza ramas y docs raíz | Mover QA reports; inventario ramas | Repo mantenible | Ninguno | Fase mantenimiento | S | Baja |
| D7 | ADR / decision log | Registrar decisiones SSOT, CSP, Branding | Contexto histórico | Ninguno | — | M | Baja |
| D8 | Mapa rutas auto-documentado | Script inventario App Router | Referencia SEO/security | Mantenimiento script | Estructura app | S | Baja |

---

## Criterios para considerar una fase como completada

Una fase se considera **cerrada** cuando se cumplen **todos** los criterios aplicables:

### Criterios obligatorios (toda fase)

| # | Criterio | Evidencia |
|---|---|---|
| 1 | Charter cumplido | Todas las iniciativas del alcance entregadas o explícitamente diferidas con justificación |
| 2 | PR mergeado a `main` | Commit en remoto con Conventional Commits |
| 3 | CI verde | `lint`, `typecheck`, `build` PASS |
| 4 | Sin regresiones conocidas P0 | Smoke manual o E2E según alcance |
| 5 | Documentación de fase | Doc en `docs/` o `docs/architecture/` si aplica |
| 6 | Auditoría aprobada | Revisión explícita del responsable de producto/arquitectura |

### Criterios adicionales por tipo de fase

| Tipo | Criterios extra |
|---|---|
| **Producto** | Tests unitarios/E2E relevantes PASS; UX validada en Preview |
| **Plataforma** | Sin degradación CWV/security baseline; runbook actualizado si aplica |
| **Operacional** | Evidencia documentada (capturas, logs, checklists GO-LIVE) |
| **Mantenimiento** | Working tree limpio; deuda objetivo reducida |

### Criterios de congelamiento (fases cerradas)

Tras el cierre, la fase queda **congelada**:

- Modificaciones futuras requieren **nueva decisión explícita** (no corrección técnica incidental).
- Ejemplo: Fase 18 Branding SSOT — ver [`branding-ssot.md`](./branding-ssot.md).

---

## Referencias

| Documento | Relación |
|---|---|
| [`architecture/adr/`](./architecture/adr/README.md) | ADR — decisiones arquitectónicas (ADR-000, ADR-019) |
| [`architecture/adr/019-clinical-workspace-observability-contract.md`](./architecture/adr/019-clinical-workspace-observability-contract.md) | Fase 19 — contrato observabilidad workspace |
| [`branding-ssot.md`](./branding-ssot.md) | Fase 18 cerrada — Branding congelado |
| [`../FRONTEND_SSOT.md`](../FRONTEND_SSOT.md) | Política repositorio SSOT (pendiente versionado: D1) |
| [`../ENTERPRISE_OPERATIONAL_RELEASE_RUNBOOK.md`](../ENTERPRISE_OPERATIONAL_RELEASE_RUNBOOK.md) | Runbook S1, T2, D4 |
| [`../RELEASE_POLICY.md`](../RELEASE_POLICY.md) | SemVer, flujo PR → main |
| [`../COMMITS.md`](../COMMITS.md) | Conventional Commits |
| [`../MULTI_REPO_CI_ARCHITECTURE.md`](../MULTI_REPO_CI_ARCHITECTURE.md) | CI frontend / boundary backend |

---

## Historial de revisiones

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-07-04 | 1.0 | Creación inicial — inventario estratégico aprobado post Fase 18 |
