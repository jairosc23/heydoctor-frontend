# Production Readiness — análisis funcional (RELEASE 1.0)

**Type:** functional audit (not a design, not a release)  
**Date:** 2026-08-25  
**Phase:** Production Readiness  
**Question:** ¿Qué falta para operar HeyDoctor con clínicas reales?

This document does not change CORE_PLATFORM, ARCHITECTURE_BASELINE, PRODUCT_PLATFORM v6.0, BUSINESS_APPLICATIONS_EPIC_1, or HEYDOCTOR_PLATFORM_FINAL_BASELINE.

No analiza arquitectura. La arquitectura está CERRADA (`docs/HEYDOCTOR_PLATFORM_FINAL_BASELINE.md`).

No crea dominios, identidades, workflows, estados, Product Platform ni Business Applications.

---

## Alcance

Auditar la **preparación para RELEASE 1.0** de la plataforma ya cerrada:

- CORE_PLATFORM = LTS  
- PRODUCT_PLATFORM v6.0 = LTS  
- BUSINESS APPLICATIONS = COMPLETE  

Clasificación: **READY** · **PARTIAL** · **MISSING**

---

## Hechos de repositorio (evidencia)

| Hecho | Evidencia |
|-------|-----------|
| Frontend LTS no está en HEAD | Rama `feat/phase-19a-clinical-workspace-closure`; HEAD `6d6ec01c`. Completion, Settlement, COD, PCC, Product v1.0–v6.0, Digital Clinic y baselines LTS están **untracked / no commitados**. |
| Frontend no está en `main` | `main` es otra línea. Vercel Production branch documentada: `main` (`.github/HARDENING.md` del backend). |
| Tag `v1.0.0` ya existe | Es un tag histórico, no este cierre LTS. |
| Backend está en `main` | `heydoctor-backend-pro-1` en `main` (`bc3db18c`). |
| GO-LIVE previo | Phase 4.9.3 / 4.9.5: **NO GO** operacional (flags workspace, E2E P0 no ejecutados). |
| Release no despliega | Workflows `release.yml` (FE y BE) crean GitHub Release; **no** despliegan Vercel/Railway. |

---

## Clasificación por elemento

### Frontend

**PARTIAL.**

- Existe app Next.js, CI L1, Sentry condicional, deploy Vercel documentado.  
- Falta: el producto LTS certificado (ficha de cierre, Product v1.0–v6.0, Digital Clinic) **no está en un commit desplegable**. Production branch = `main`; LTS vive en working tree de otra rama.

### Backend

**PARTIAL.**

- Nest en `main`: health, Auth, usuarios por clínica, Payku, CI L1/L2, throttler.  
- Falta: emparejar un **par de release** FE LTS + BE `main` versionado. Documento histórico de Railway describe **dos backends** (Express vs Nest) — riesgo de punta de producción equivocada.

### Base de datos

**PARTIAL.**

- PostgreSQL + migraciones TypeORM.  
- Falta: prueba reciente de backup/restore sobre la BD de clínicas; el gate de migraciones es `workflow_dispatch` y puede **saltarse** si no hay `DATABASE_URL`.

### CI/CD

**PARTIAL.**

- CI en `push`/`PR` a `main`.  
- Falta: la rama LTS no es `main` (el CI de `main` no certifica Completion/Settlement/Product). E2E P0 y F2-01 **se saltan** si faltan secrets (aggregate PASS con degradación). Tag `v*` no despliega.

### Deploy

**PARTIAL.**

- Vercel (frontend) y Railway (backend) existen; API pública documentada `https://pro-api.heydoctor.health`.  
- Falta: desplegar el commit LTS (no existe). Deploy por push a `main`, no por tag de Release 1.0. Checklist L3 es eco documental, no un gate que promueva producción.

### Rollback

**PARTIAL.**

- Runbook enterprise: Instant Rollback Vercel + rollback Railway; preferir revert. Script `rollback.mjs` solo **evalúa** si hay IDs previos.  
- Falta: IDs de deployment LTS (no hay release LTS). Restore de BD es interactivo (`read -p`). No hay ensayo de rollback del par FE+BE de este cierre.

### Observabilidad

**PARTIAL.**

- Sentry en frontend **si** hay `NEXT_PUBLIC_SENTRY_DSN`. `CorrelationId` es tracing de Core (working tree).  
- Falta: DSN/release alineados verificados en producción para este Release. Sentry no es obligatorio en build.

### Logs

**PARTIAL.**

- Logs nativos Railway / Vercel.  
- Falta: contrato operativo de retención, acceso y PHI para clínicas en Release 1.0 (quién mira, cuánto tiempo, qué no loguear).

### Health checks

**PARTIAL.**

- Backend READY a nivel de endpoints: `/healthz`, `/livez`, `/readyz`, `/api/health` (+ `/full` con clave).  
- Falta: el frontend no expone `livez`/`readyz` propios; el smoke de UI no cubre URLs LTS (no están en HEAD).

### Backups

**PARTIAL.**

- Workflow diario `backup.yml` (pg_dump → objeto, retención 30 días).  
- Falta: evidencia de que los secrets (`DATABASE_URL`, bucket) están configurados y de que el último job **pasó**. Sin eso no hay backup operable.

### Restore

**PARTIAL.**

- `scripts/restore-postgres.sh` existe.  
- Falta: drill no interactivo; RTO/RPO acordados; restore ensayado contra un entorno de clínicas (no solo el script).

### Monitoreo

**PARTIAL.**

- Métricas Railway; `GET /api/admin/ops/scaling` es heurística (Railway **no** escala solo con ese JSON).  
- Falta: monitoreo de las superficies LTS (entrega, caja, pulso, portal Encounter) — esas rutas no están en producción.

### Alertas

**PARTIAL.**

- Slack de CI **opcional** (`SLACK_WEBHOOK_URL`; no-op si falta). `.github/RELEASE.md` declara alertas de deploy/Sentry como **próximo paso**.  
- Falta: alerta de fallo de deploy Railway/Vercel, de backup fallido, y de 5xx en API, con dueño.

### Secrets

**PARTIAL.**

- `.env.example` FE/BE; secrets de GitHub para CI/smoke/backup.  
- Falta: inventario verificado de producción (JWT, Payku, DB, Redis, Sentry) y rotación. Flags peligrosos documentados (`ALLOW_FAKE_PAYMENTS`, `JWT_DEBUG`) no auditados en runtime de este análisis.

### Seguridad

**PARTIAL.**

- Auth, CORS, cookies de sesión, throttler, hardening de rama `main`.  
- Falta: verificar flags de workspace y pagos en el entorno que atenderá clínicas; E2E Auth puede estar skipped. D9 share sigue fuera de alcance (freeze), no es un hueco de release de LTS.

### Performance

**PARTIAL.**

- Base F2-09 documentada.  
- Falta: prueba de carga del cierre clínico-comercial LTS (Completion + Settlement) con clínicas reales. No hay evidencia de esa corrida.

### Escalabilidad

**PARTIAL.**

- Guía `RAILWAY-SCALING.md`; réplicas se configuran en el panel.  
- Falta: política de réplicas acordada para horario de consulta; Redis para throttler multi-instancia es opcional (`REDIS_URL`).

### Rate limiting

**READY.**

- Nest `@nestjs/throttler` en API; health público con `@SkipThrottle`. Fallback memoria si no hay Redis.

### Auditoría

**PARTIAL.**

- Backend: `audit_logs`. Core LTS: cadenas Completion/Settlement CERTIFIED **en working tree**.  
- Falta: esas cadenas no están en HEAD ni en `main`; no hay bitácora de acceso a ficha (Auth freeze — no se reabre aquí).

### Documentación

**PARTIAL.**

- Baselines LTS y cierre de plataforma existen (algunos aún untracked). Runbooks enterprise de Preview/GO-LIVE 4.9.x.  
- Falta: un paquete de **Release 1.0** para operadores (qué SHA, qué URLs LTS, qué no tocar). README del frontend describe un árbol antiguo, no el panel LTS.

### Onboarding de clínicas

**PARTIAL.**

- API: usuarios por `clinicId` (`createUserForClinic`). Doc `MULTI-CLINIC-INTEGRATION.md`.  
- Falta: procedimiento operativo (contrato, tenant, marca, pagos, quién crea la clínica, checklist de primer día). Multi-sede de negocio sigue BLOQ (no se inventa aquí).

### Onboarding de médicos

**PARTIAL.**

- Auth + alta de usuario.  
- Falta: guía de primer uso de la clínica digital (Atención / Caja / Dirección / Operaciones = URLs LTS). Esas URLs no están desplegadas.

### Configuración

**PARTIAL.**

- Flags `NEXT_PUBLIC_*` (workspace default **false** en código).  
- Falta: valores de producción verificados para el workspace oficial. Phase 4.9.0 dejó F5 abierto.

### Variables de entorno

**PARTIAL.**

- Ejemplos en repo. FE exige `NEXT_PUBLIC_HEYDOCTOR_API_URL` en build de producción.  
- Falta: checklist firmado Preview vs Production (F2-13) para el par LTS.

### Migraciones

**PARTIAL.**

- Migraciones + `migration-gate.yml`.  
- Falta: gate **obligatorio** contra la BD de producción antes del Release (hoy skippable). No hay migraciones nuevas de LTS (LTS es consume-only) — el riesgo es el esquema **ya** en prod, no un dominio nuevo.

### Release process

**PARTIAL.**

- SemVer, tags `v*`, GitHub Release, checklist L3 impresa en el job.  
- Falta: SHA LTS commiteado; promoción explícita a `main`; tag **nuevo** de este cierre (el `v1.0.0` existente no es este producto); deploy atado al tag.

### QA

**PARTIAL.**

- L1: lint/typecheck/build/unit. Certificación LTS 161/161 y BA 12/12 en working tree.  
- Falta: esas suites no corren en CI de `main`. E2E P0 histórico NO GO. No hay QA de las URLs LTS en un entorno real.

### Smoke tests

**PARTIAL.**

- API smoke cada 6 h + `workflow_dispatch`. UI smoke manual.  
- Falta: smoke de `/panel/entrega-clinica`, `/panel/integridad-ingresos`, `/panel/pulso-operativo`, portal Encounter — páginas ausentes en HEAD.

### Disaster Recovery

**PARTIAL.**

- Backup + restore scripts.  
- Falta: RTO/RPO, failover, dueño, última prueba. Sin drill no hay DR para clínicas.

### Soporte

**MISSING.**

- No hay canal, horario, runbook ni cola de tickets para clínicas en producción. `privacy@heydoctor.health` no es mesa de soporte clínico-operativo.

### Runbooks

**PARTIAL.**

- Enterprise rollback, Preview GO-LIVE 4.9, Railway scaling, restore.  
- Falta: runbook de **Release 1.0 LTS** (qué se promueve, qué se verifica, qué se revierte) sobre el SHA certificado.

### Incidentes

**PARTIAL.**

- Código de incident store; playbook Wave-2.  
- Falta: on-call, severidades acordadas con clínicas, catálogo de incidentes LTS (cierre de acto, caja, Payku).

### Producción

**PARTIAL.**

- Dominios y API de producción existen.  
- Falta: el producto LTS **no está** en esa punta. GO-LIVE 4.9.x quedó **NO GO**. No hay autorización de Release 1.0 sobre el cierre de plataforma.

---

## Qué falta para operar con clínicas reales

No falta arquitectura. Falta **poner el producto cerrado en un commit desplegable** y **cerrar operación**:

1. LTS commiteado y promocionable (`main` / tag de este cierre).  
2. Par FE+BE identificado y desplegado.  
3. Flags y secretos de producción verificados.  
4. Backup con evidencia de éxito + restore ensayado.  
5. Smoke (API+UI) sobre las URLs LTS.  
6. Alertas con dueño (deploy, 5xx, backup).  
7. Onboarding operativo de clínica y médico (procedimiento, no dominio).  
8. Soporte e incidentes con horario.

Hasta entonces, una clínica real no puede usar Completion, Settlement, Product v1.0–v6.0 ni Digital Clinic en producción: **ese código no está en el artefacto desplegable**.

---

## Veredicto

**NO-GO para RELEASE 1.0.**

Esperar **autorización explícita** antes de iniciar cualquier Release (commit, merge, tag, deploy).
