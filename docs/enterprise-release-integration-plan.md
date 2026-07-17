# Enterprise Release — Plan de integración (merge readiness)

> Fecha: 2026-07-16  
> Modo: **auditoría Git únicamente**  
> **NO** se ejecutó merge · rebase · cherry-pick · reset · deploy · promotion

---

## Pregunta

¿Puede **Agenda Enterprise** (`feature/agenda-enterprise`) incorporarse íntegramente sobre **Medical Copilot** (`release/medical-copilot-v1.0-rc2`) **sin pérdida de código**?

### Respuesta: **SÍ**

Evidencia: `git merge-tree --write-tree` limpio en **Frontend** y **Backend**, en ambas direcciones (MC←AG y AG←MC), **0** marcadores `<<<<<<<`.  
Solapamiento de paths: **solo** docs `heydoctor-enterprise-*` con **blobs idénticos** (mirror previo).

---

## Baselines auditados

| Repo | Merge-base | MC HEAD | AG HEAD | AG ahead | MC ahead |
|------|------------|---------|---------|----------|----------|
| Frontend | `82de5585` (GA-FIX deeplink) | `a4cb67e2` | `f1a4bfa2` | 11 | 6 |
| Backend | `356e97f` (GA-FIX sessionId) | `1e253df` | `6424adc` | 6 | 7 |

---

## Commits exclusivos

### Frontend — solo Agenda (`MC..AG`)

1. `88849fc0` Phase 1 availability  
2. `252a588c` Phase 2 rules  
3. `260cd2d5` Phase 3 slots  
4. `112036df` Phase 4 blocks  
5. `958945d1` Phase 5 waitlist  
6. `89635d39` Phase 6 reminders  
7. `5213f691` Phase 7 timezone  
8. `384b3126` Phase 8 UX  
9. `99f694f8` Phase 9 dashboard  
10. `3902bf6c` Phase 10 QA docs  
11. `f1a4bfa2` enterprise global audit docs  

### Frontend — solo Copilot (`AG..MC`)

1. `44a0dc23` RC3 lazy mount / package-first  
2. `5d781037` RC4 virtualization / metrics  
3. `4d5e760d` RC5 resilience / observability  
4. `011078ee` RC6 FE certification freeze  
5. `ed2d1d38` POST-RC6 FE manifests  
6. `a4cb67e2` enterprise audit docs mirror  

### Backend — solo Agenda

1. `ba0b3c6` availability rules mutations  
2. `30c8998` schedule blocks mutations  
3. `4b69e57` waitlist mutations  
4. `d6eac6d` reminder policies  
5. `8284141` clinic IANA timezone  
6. `6424adc` appointments.service.spec ctor fix + audit docs  

### Backend — solo Copilot

1. `29137cf` RC3 operational / memoization  
2. `ec50517` foundation migration RC3  
3. `ec4aaa1` RC4 hardening  
4. `8d1fd03` RC5 production readiness  
5. `86be4c6` RC6 certification freeze  
6. `046ac2e` POST-RC6 manifests  
7. `1e253df` enterprise audit docs mirror  

---

## Análisis de conflictos

| Categoría | Frontend | Backend |
|-----------|----------|---------|
| Conflictos de contenido (merge-tree) | **0** | **0** |
| Paths tocados en ambos lados | 9 docs enterprise (idénticos) | 9 docs enterprise (idénticos) |
| package-lock / package.json | Sin cambios desde merge-base en ambos lados | Sin cambios |
| pnpm-lock | No existe | No existe |
| Migrations | N/A FE | Timestamps **sin colisión** (ver abajo) |
| Barrels / exports | AG no toca `index.ts`; MC añade muchos bajo `lib/medical-copilot/**` | AG: `appointments.module`, `clinic.module`; MC: `ai.module` — **sin overlap** |
| Rutas app | AG: `/panel/agenda`, config; MC: consultas/medical-copilot — **sin overlap** |
| Deletes / renames | Ninguno desde merge-base | Ninguno |
| Auth compartido | AG modifica `auth.ts` / `auth-session.ts` / `clinic.ts`; MC **no** — incorporación limpia | AG: `auth.service.ts`; MC: `request-context.storage.ts` — **paths distintos** |

### Migrations (orden union)

```
1751300000000-MedicalCopilotFoundation.ts     ← solo MC
1752600000000-ScheduleBlocksIsActive.ts       ← solo AG
1752700000000-WaitlistPriorityReason.ts       ← solo AG
1752800000000-ReminderPoliciesAndOffset.ts    ← solo AG
1752900000000-ClinicAndDoctorTimezone.ts      ← solo AG
```

Sin colisión de nombres ni timestamps.

---

## Estrategia de merge (NO EJECUTAR aún)

**Objetivo de integración:** base = Copilot RC2; incorporar Agenda completa; preservar RC3–RC6 + F1–F10.

### Orden recomendado

1. **Backend primero** (migraciones + SSOT Agenda + AI RC).  
2. Validar BE gates.  
3. **Frontend** después (Agenda UI + Copilot RC FE).  
4. Validar FE gates + Playwright staging.  
5. Solo entonces considerar tag unificado / promotion (fuera de este plan).

### Procedimiento propuesto (futuro, humano)

Por repo:

```text
git checkout release/medical-copilot-v1.0-rc2
git merge --no-ff origin/feature/agenda-enterprise
# resolver SOLO si apareciera algo inesperado (no esperado hoy)
# NO squash (preservar historial de fases/RC)
```

Alternativa equivalente: merge RC2 → `feature/agenda-enterprise` y promover esa punta; **mismo contenido** si merge-tree limpio.

**Prohibido en la ejecución futura (salvo instrucción explícita):** rebase interactivo, squash de RC/fases, force-push, reset duro.

---

## Archivos críticos a revisar post-merge (smoke)

| Área | Paths |
|------|-------|
| Agenda FE | `app/panel/agenda/page.tsx`, `components/agenda/**`, `lib/agenda/**`, hooks availability/blocks/waitlist/reminders/timezone |
| Copilot FE | `app/panel/consultas/[id]/medical-copilot/**`, `lib/medical-copilot/**` |
| Shared FE | `lib/services/auth.ts`, `auth-session.ts`, `clinic.ts`, `appointments.ts` |
| Agenda BE | `appointments/**`, `appointments-enterprise/**`, `clinic/**`, migrations 17526*–17529* |
| Copilot BE | `src/ai/**`, migration `1751300000000-MedicalCopilotFoundation.ts` |
| Docs | `docs/heydoctor-enterprise-*` (deben quedar una sola copia idéntica) |

---

## Checklist pre-merge (humano)

- [ ] Confirmar HEADs remotos sin commits nuevos no auditados  
- [ ] Backup/tag opcional de ambas ramas  
- [ ] Ejecutar merge BE en working copy / PR  
- [ ] `format` / `lint` / `build` / `tests` BE  
- [ ] Ejecutar merge FE  
- [ ] `lint` / `tsc` / `build` / `tests` FE  
- [ ] Playwright RC2 + smoke Agenda en staging (`.env.e2e`)  
- [ ] Verificar migraciones en orden  
- [ ] Aprobación producto/ops  

## Checklist post-merge

- [ ] `/panel/agenda` tabs F1–F9  
- [ ] `/panel/consultas/[id]/medical-copilot` kill switch + ownership  
- [ ] No pérdida de commits RC3–RC6 ni F1–F10 (`git log` ambos ranges vacíos vs tip)  

---

## Rollback plan

| Momento | Acción |
|---------|--------|
| Antes de push del merge | `git merge --abort` |
| Después de push, pre-deploy | Revert del merge commit (`git revert -m 1 <merge_sha>`) en la rama unificada; **no** reescribir RC2/Agenda históricos |
| Deploy ya hecho | Rollback Vercel/Railway al deployment anterior; BE: no bajar migraciones aditivas sin plan DBA |

Ramas origen `release/medical-copilot-v1.0-rc2` y `feature/agenda-enterprise` deben **permanecer** como referencias hasta promoción estable.

---

## Blockers (documentados — NO resueltos aquí)

| ID | Severidad | Blocker | Acción requerida (futura) |
|----|-----------|---------|---------------------------|
| B1 | Proceso | Merge no autorizado en esta fase | Instrucción humana explícita |
| B2 | QA | Playwright RC2 sin `.env.e2e` en auditoría previa | Ejecutar en staging antes de GO prod |
| B3 | Proceso | Aprobación humana merge + deploy | Checklist |

**No hay blocker técnico de conflictos Git** que impida la unificación.

---

## Decisión

| Pregunta | Decisión |
|----------|----------|
| ¿Incorporación íntegra sin pérdida de código es posible? | **GO (técnico)** |
| ¿Ejecutar merge ahora? | **NO GO (política / esta fase)** |
| ¿Crear release unificada / deploy? | **NO GO** hasta merge ejecutado + gates |

---

## Detención

Este documento termina el alcance. Esperar instrucciones para ejecutar el merge.
