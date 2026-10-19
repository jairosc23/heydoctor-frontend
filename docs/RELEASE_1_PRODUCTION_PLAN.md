# RELEASE 1.0 — plan de producción

**Type:** operational release plan (not an Epic, not a design of product)  
**Date:** 2026-08-25  
**Program:** Release Phase · RELEASE 1.0  
**Source:** `docs/PRODUCTION_READINESS_ANALYSIS.md` · `docs/HEYDOCTOR_PLATFORM_FINAL_BASELINE.md`

This document does not modify CORE_PLATFORM, ARCHITECTURE_BASELINE, PRODUCT_PLATFORM v6.0, BUSINESS_APPLICATIONS, HEYDOCTOR_PLATFORM_FINAL_BASELINE, or any certified baseline.

No abre arquitectura. No abre Product Platform. No abre Business Applications. No diseña funcionalidades. No implementa funcionalidades nuevas.

**Authorization:** this plan does not authorize implementation. Wait for explicit authorization before starting any Release.

---

## Principio

El LTS ya está certificado. El hueco es **operacional**: el working tree no es un artefacto.

RELEASE 1.0 = convertir el LTS certificado en un SHA desplegable, emparejado, verificado y operable con clínicas.

Nunca un Epic de plataforma.

---

## Invariantes (todas las Releases)

- No modificar archivos LTS congelados (código ni baselines) salvo **higiene de repositorio** (añadir al git el árbol ya certificado, sin cambiar comportamiento).
- No crear dominios, identidades, workflows, estados, Product Platform ni Business Applications.
- No cambiar `PanelLayout`, Auth, Workspace, Foundation, Branding, WebRTC, portal legado ni agenda.
- Tag histórico `v1.0.0` **no** se reutiliza. Este programa usa un tag nuevo (propuesto: `v1.0.0-lts`).
- Frontend Production branch documentada: `main`. Backend de punta: Nest `heydoctor-backend-pro` en Railway (`pro-api.heydoctor.health`), no el Express legado.
- Si un PASS exige cambiar LTS: **STOP** — incidente independiente + autorización; no es esta Release.

---

## Releases necesarias

| ID | Nombre | Bloques | Puede empezar en paralelo | PASS desbloquea |
|----|--------|---------|---------------------------|-----------------|
| R1 | Artefacto | Repositorio, working tree, commits, merge, tags, versionado, CI | — | SHA LTS en `main` + tag + CI verde |
| R2 | Par runtime | Backend, frontend, variables, secrets, migraciones, smoke | Inventario de secrets **después** de R1 SHA (no antes del commit) | Par FE+BE + env + gate de migraciones + smoke Preview |
| R3 | Operación de punta | Deploy, rollback, health, observabilidad, alertas, logs, backups, restore | Redactar runbooks en paralelo; **ejecutar** solo con R2 PASS | Punta desplegada + rollback IDs + backup/restore evidenciados |
| R4 | Decisión | QA, E2E, acceptance, checklist, GO / NO-GO | Preparar checklist en paralelo | GO o NO-GO escrito |
| R5 | Clínica operable | Operación, onboarding, runbooks, incidentes, soporte, monitoreo | Borradores en paralelo desde R2 | Primera clínica puede operar con dueño y canal |

Orden de **ejecución** (crítico): **R1 → R2 → R3 → R4 → R5**.

Orden de **preparación documental**: R2–R5 pueden redactarse tras R1; no se ejecutan contra producción sin el SHA de R1.

---

## Release R1 — Artefacto

### Objetivo

Meter el LTS certificado en git, en `main`, con CI verde y un tag que no colisione, sin cambiar el comportamiento certificado.

### Entradas

- Repo frontend: `heydoctor-frontend`, rama `feat/phase-19a-clinical-workspace-closure`, HEAD de certificación `6d6ec01c`.
- Working tree: Completion, Settlement, COD, PCC, Product v1.0–v6.0, Digital Clinic, docs LTS (hoy untracked / no en HEAD).
- Repo backend: `heydoctor-backend-pro-1`, `main` (p. ej. `bc3db18c`) — **no se mezcla en este commit frontend**.
- `docs/HEYDOCTOR_PLATFORM_FINAL_BASELINE.md` (catálogo; no se edita).
- CI frontend existente (`.github/workflows/ci.yml`).

### Salidas

- Commits en frontend que **añaden** el árbol certificado (mismo comportamiento; cero features).
- PR a `main` (o política de integración acordada si `main` diverge: **un** merge/PR, no un rediseño).
- SHA de `main` que contiene el LTS (llamarlo **SHA-FE-LTS**).
- Tag anotado nuevo: `v1.0.0-lts` (no `v1.0.0`).
- Job aggregate `frontend` **verde** en SHA-FE-LTS (L1 obligatorio; L2 E2E no skipped si hay secrets — si no hay secrets, R1 PASS condicionado y R4 no puede ser GO).
- Registro escrito: SHA-FE-LTS, tag, SHA-BE (`main` backend al momento del par).

### Dependencias

Ninguna Release previa. Bloquea R2–R5.

### Riesgos

| Riesgo | Efecto |
|--------|--------|
| Merge a `main` con 169+ commits de desfase | Conflicto masivo; tentación de “arreglar” LTS. **Prohibido.** Resolver solo conflictos de integración, sin cambiar contratos LTS. |
| CI L1 falla al commitear el árbol | No es un Epic: es higiene (imports, tests ya certificados). Si hay que cambiar comportamiento LTS → STOP. |
| Commitear `.env.local` u otros secretos | Bloqueo inmediato; no entra al artefacto. |
| Reutilizar tag `v1.0.0` | Punta y notas históricas incorrectas. |

### PASS

1. `git ls-files` incluye `lib/clinical-completion`, `lib/commercial-settlement`, `lib/clinical-operations`, `lib/patient-care-continuity`, `lib/product-platform`, `lib/business-applications/digital-clinic`, y las rutas `/panel/entrega-clinica`, `/panel/integridad-ingresos`, `/panel/continuidad-longitudinal`, `/panel/brief-previsita`, `/panel/pulso-operativo`, `/portal/(app)/encounter`.  
2. Esas rutas están en **SHA-FE-LTS** en `main` (o en la rama de producción acordada, documentada).  
3. Tag `v1.0.0-lts` apunta a SHA-FE-LTS.  
4. CI L1 verde en ese SHA.  
5. Diff de comportamiento LTS vs working tree certificado = **vacío** (solo integración git).  
6. Cero cambios a baselines congeladas.

### Tiempo estimado

**2–5 días laborables** (el riesgo es el merge a `main`, no el volumen de producto).

---

## Release R2 — Par runtime

### Objetivo

Fijar frontend LTS + backend Nest de punta, con variables/secrets, migraciones y smoke de Preview, sin desplegar producción todavía.

### Entradas

- SHA-FE-LTS + tag `v1.0.0-lts` (R1 PASS).
- SHA-BE = tip `main` del Nest acordado (registrar hash).
- `.env.example` FE y BE.
- Workflows: `migration-gate.yml`, `smoke-post-deploy.yml` (API y UI).
- Lista de URLs LTS (no se inventan rutas).

### Salidas

- Documento de par (no es baseline de plataforma): SHA-FE-LTS, SHA-BE, `NEXT_PUBLIC_HEYDOCTOR_API_URL` = Nest prod/preview acordado.
- Inventario de variables Preview vs Production (valores **presentes/ausentes**, no volcar secretos).
- Confirmación: Railway sirve Nest, no Express legado.
- `migration-gate` ejecutado contra la BD **objetivo** (Preview o réplica); 0 pendientes inesperados **sin** `ALLOW_PENDING` salvo waiver escrito.
- Smoke API + UI contra **Preview** del SHA-FE-LTS (no skipped).
- Flags peligrosos verificados en el entorno de prueba: `ALLOW_FAKE_PAYMENTS=false`, `JWT_DEBUG=false`, workspace flags según runbook 4.9 (verificar, no rediseñar).

### Dependencias

R1 PASS.

### Riesgos

| Riesgo | Efecto |
|--------|--------|
| Punta Express vs Nest | Login/health 404; clínica inoperable. |
| E2E/smoke skipped por secrets | R2 no puede PASS. |
| Gate de migraciones skipped | Esquema de clínicas desconocido. |
| Preview apuntando a API de prod | Contaminación; usar Preview API o waiver explícito (el runbook enterprise ya describe Preview FE + API prod: si se usa, documentar y no mutar datos de clínicas reales). |

### PASS

1. Par SHA-FE-LTS + SHA-BE publicado (hashes).  
2. Inventario de secrets/vars: todos los **required** del `.env.example` marcados presente en Preview.  
3. Migration gate **run** (no skip) = PASS.  
4. Smoke API y smoke UI **run** = PASS contra Preview del tag.  
5. Backend de punta = Nest (`/api/health`, `/api/auth/login` no 404).

### Tiempo estimado

**1–2 días laborables** (si secrets ya existen; +1 día si hay que crearlos en GitHub/Vercel/Railway).

---

## Release R3 — Punta y continuidad

### Objetivo

Desplegar el par a producción (o al entorno que atenderá clínicas), dejar rollback accionable, y demostrar health, observabilidad, alertas, logs, backup y restore.

### Entradas

- R2 PASS.
- Vercel Production = `main` @ SHA-FE-LTS.
- Railway servicio Nest @ SHA-BE.
- `backup.yml`, `scripts/restore-postgres.sh`, health Nest, Sentry opcional, Slack opcional.
- Runbooks enterprise de rollback (usar; no reescribir LTS).

### Salidas

- Deployment IDs: Vercel production, Railway production.  
- Health prod: `/healthz`, `/livez`, `/readyz` = ok.  
- Sentry DSN presente en prod **o** waiver escrito (sin DSN, R4 no puede ser GO pleno).  
- Alerta mínima: fallo de backup y/o 5xx (Slack u otro canal ya usado; no se inventa un producto de alerting).  
- Nota de logs: quién accede, que no se loguee PHI de más (política, no código LTS).  
- Evidencia: job de backup **success** reciente; restore ensayado en entorno **no productivo** (staging/réplica).  
- Registro de rollback: commit previo + IDs de deployment previos (lo que `rollback.mjs` exige).

### Dependencias

R2 PASS. No promover producción si Preview smoke falló.

### Riesgos

| Riesgo | Efecto |
|--------|--------|
| Deploy por push a `main` desalineado del tag | Promocionar solo SHA-FE-LTS. |
| Backup secrets ausentes | No hay continuidad. |
| Restore solo en prod | Prohibido en el ensayo; usar réplica. |
| Redis ausente + varias réplicas | Throttler en memoria por instancia (aceptable si réplica=1; documentar). |

### PASS

1. Prod (o entorno clínico acordado) sirve SHA-FE-LTS + SHA-BE.  
2. Health Nest ok.  
3. IDs de rollback registrados.  
4. Backup job success (evidencia de run).  
5. Restore drill PASS en no-prod.  
6. Al menos un canal de alerta de infra (CI o backup o 5xx) no es no-op.

### Tiempo estimado

**2–3 días laborables**.

---

## Release R4 — GO / NO-GO

### Objetivo

Probar el producto LTS **ya desplegado** (sin añadir features) y decidir GO o NO-GO por escrito.

### Entradas

- R3 PASS.
- URLs LTS existentes:  
  `/panel/entrega-clinica`  
  `/panel/integridad-ingresos`  
  `/panel/continuidad-longitudinal/[patientId]`  
  `/panel/brief-previsita/[patientId]`  
  `/panel/pulso-operativo`  
  `/portal/encounter/[encounterId]`  
  ficha Encounter (cierre Completion + Settlement)  
  Digital Clinic = navegación a esas URLs (`writes: false`).
- Credenciales QA (médico, caja). No inventar roles.
- E2E P0 / F2-01 / smoke post-deploy: **secrets configurados** (no skip).

### Salidas

- Resultados E2E P0 y F2-01 = PASS (no skipped).  
- Acceptance manual (una pasada por proceso Digital Clinic: Atención, Caja por Encounter, Dirección, Operaciones) sobre URLs LTS.  
- Checklist L3 (PQ-09) firmada: CI verde en SHA taggeado, smoke contra **producción o Preview de prod-tip**, cero Sev-1 abiertos.  
- Acta: **GO** o **NO-GO**, fecha, firmantes, SHA-FE-LTS, SHA-BE.

### Dependencias

R3 PASS. R1 L2 skipped ⇒ R4 no puede GO.

### Riesgos

| Riesgo | Efecto |
|--------|--------|
| E2E histórico 4.9.x NO GO | Puede repetirse; R4 = NO-GO, no un Epic de tests nuevos (usar suites existentes). |
| Visor PDF / D9 | Fuera de LTS; no bloquean si el resto del acto/caja PASS (incidente aparte si se autoriza). |
| “Arreglar” fallos cambiando LTS | Prohibido. NO-GO u incidente. |

### PASS (GO)

Todos:

1. E2E P0 PASS (run).  
2. F2-01 PASS (run).  
3. Smoke API+UI contra la punta que atenderá clínicas = PASS.  
4. Acceptance: un Encounter de prueba cierra acto y caja; dirección ve pulso; operaciones rutea a v1/v2.  
5. Cero Sev-1 en Auth, agenda, cierre, pagos.  
6. Acta GO firmada.

Si falla cualquiera: **NO-GO**. No se abre Epic. Se espera autorización para un incidente o para repetir R2–R4.

### Tiempo estimado

**2–3 días laborables**.

---

## Release R5 — Operación de clínicas

### Objetivo

Dejar procedimiento (no producto) para onboarding, incidentes, soporte y monitoreo, usando Auth/Workspace y Digital Clinic ya certificados.

### Entradas

- R4 **GO**.  
- API existente `createUserForClinic`.  
- Runbooks enterprise (rollback, Railway).  
- Digital Clinic: cuatro procesos, URLs LTS.  
- Canal mínimo (email/Slack ya usado). No ITSM nuevo.

### Salidas

- Procedimiento de onboarding **clínica** (alta, usuario admin, API URL, flags) — checklist, no dominio.  
- Procedimiento de onboarding **médico** (cuenta, primer Encounter de prueba, mapa Atención/Caja/Dirección/Operaciones).  
- Runbook Release 1.0: SHA, URLs, rollback IDs, health, backup.  
- Incidentes: severidad, dueño, horario, qué revertir (FE / BE / no schema down).  
- Soporte: un canal y horario publicados internamente.  
- Monitoreo: health + Sentry (si no waiver) + pulso v5.0 como tablero de centro (ya LTS; no consola nueva).

### Dependencias

R4 GO. Sin GO no hay operación de clínicas reales.

### Riesgos

| Riesgo | Efecto |
|--------|--------|
| Confundir onboarding con multi-sede / IAM nuevo | STOP — BLOQ de arquitectura. Solo usuarios/clínica existentes. |
| Consola de dirección / BI | Ya REJECTED; usar `/panel/pulso-operativo`. |
| Soporte sin horario | Clínica real sin dueño = no operable. |

### PASS

1. Checklist de onboarding clínica + médico ejecutada una vez (clínica piloto o staging equivalente).  
2. Runbook 1.0 con SHA e IDs de rollback.  
3. Canal de soporte + dueño de incidentes nombrados.  
4. Health y (Sentry o waiver) + pulso v5.0 usados como monitoreo, sin superficie nueva.

### Tiempo estimado

**2–3 días laborables**.

---

## Dependencias (grafo)

```
R1 Artefacto (SHA-FE-LTS, tag v1.0.0-lts, CI L1)
    └── R2 Par runtime (SHA-BE, env, migraciones, smoke Preview)
            └── R3 Punta (deploy, rollback, health, backup/restore, alertas)
                    └── R4 QA / E2E / acceptance / GO|NO-GO
                            └── R5 Operación (onboarding, runbooks, soporte)
```

- R5 no arranca contra clínicas reales sin R4 GO.  
- Inventario de secrets y borradores de runbook pueden redactarse durante R1, no sustituyen R1 PASS.

---

## Riesgos de programa

1. **Merge a `main`** — mayor riesgo de calendario y de contaminación de LTS.  
2. **CI/E2E skipped** — artefacto “verde” falso; R4 NO-GO.  
3. **Punta Express** — backend equivocado.  
4. **Backup no evidenciado** — GO clínico sin continuidad.  
5. **Presión por features** — turnero, convenios, visor PDF: **fuera**. Incidente o rechazo, no Release 1.0.  
6. **Tag `v1.0.0`** — no reutilizar.

---

## Recomendación

Ejecutar **solo R1→R5** en ese orden, como Releases **operacionales**.

No implementar hasta **autorización explícita** de R1.

Si R4 = NO-GO: no abrir Product Platform ni Business Applications; repetir el tramo fallido o abrir incidente independiente.

**RELEASE 1.0 no está autorizado por este documento.**
