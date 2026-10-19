# HeyDoctor — Auditoría Enterprise Global

> Fecha: 2026-07-16  
> Modo: **solo auditoría + documentación** (sin nuevas funcionalidades)  
> Productos: **Medical Copilot** + **Agenda Enterprise** como plataforma única  
> Merge / deploy / promotion: **NO ejecutados**

---

## Baselines certificados (dual-branch)

| Producto | Branch | Frontend HEAD | Backend HEAD |
|----------|--------|---------------|--------------|
| Medical Copilot (RC6 / POST-RC6) | `release/medical-copilot-v1.0-rc2` | `ed2d1d38` | `046ac2e9` |
| Agenda Enterprise (F1–F10) | `feature/agenda-enterprise` | `3902bf6c` (+ docs esta auditoría) | `82841419` (+ fix test mínimo) |

**Realidad Git (árbol de trabajo auditado = `feature/agenda-enterprise`):**

| Repo | vs `release/medical-copilot-v1.0-rc2` |
|------|--------------------------------------|
| Frontend | +10 / −5 commits (diverge) |
| Backend | +5 / −6 commits (diverge) |

---

## Veredicto ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Copilot y Agenda están desacoplados en código? | **Sí** — sin imports cruzados de producto |
| ¿Coexisten en la misma plataforma (monolito + panel)? | **Sí** |
| ¿Están certificados cada uno en su rama? | **Sí** (productos independientes) |
| ¿Un único release/deploy unificado “HeyDoctor vX” hoy? | **NO GO** — baselines y migraciones divergen |
| ¿Deploy de plataforma con runbooks separados? | **GO condicionado** — tras merge controlado + smoke por producto |

**Score de madurez conjunta (auditoría 2026-07-16): 78 / 100**  
Listo como plataforma clínica controlada; **no** como release unificado automático.

---

## 1. Arquitectura

### Bounded contexts

| Contexto | FE | BE | Persistencia |
|----------|----|----|--------------|
| Medical Copilot | `/panel/consultas/[id]/medical-copilot`, `lib/medical-copilot/` | `AiModule`, facade `/medical-copilot/*`, `ClinicalCopilotModule` | Sesión/workspace/memory/timeline **efímeros**; AI governance en DB |
| Agenda Enterprise | `/panel/agenda`, `lib/agenda/`, `components/agenda/` | `AppointmentsModule` + `AppointmentsEnterpriseModule` + `ClinicModule` | PostgreSQL (citas, rules, blocks, waitlist, reminders, timezone) |
| Compartido | Auth, clinic, patients, consultations, panel shell | `auth`, `clinic`, `patients`, `consultations`, guards globales | Tenant `clinicId` |

### SSOT

- **Agenda:** Backend es SSOT; FE = React Query + presentación (Dashboard F9 sin APIs nuevas).  
- **Copilot:** Facade BE + estado FE (store/context); artefactos de sesión no son EMR SSOT.  
- **No hay motor paralelo** Agenda↔Copilot.

### Acoplamiento

| Tipo | Hallazgo |
|------|----------|
| Imports cruzados producto | **Ninguno** |
| Compartido | Auth, CSRF, clinic scope, consultas, barrel `lib/services` |
| Riesgo UX | Drawer generativo legacy + workspace RC2 en la misma consulta |
| Riesgo ops | Dual-branch + monolito DB + deploys Vercel/Railway independientes |

### Duplicación / código muerto (inventario)

| Ítem | Severidad | Notas |
|------|-----------|-------|
| Dos superficies AI en consulta | Medio | Documentado; no unificado |
| `fetchClinicMe` deprecated | Bajo | Fuera de Agenda; no reintroducir |
| Slot occupancy derivada en FE | Medio | F3 Agenda |
| Comentario stale availability | Bajo | Corregido en Agenda F10 |

---

## 2. Workflows auditados

| Workflow | Estado | Notas |
|----------|--------|-------|
| Consulta clínica | ✔ plataforma | Ancla Copilot (`consultationId`) |
| Medical Copilot HITL | ✔ certificado RC2 | Kill switch + ownership |
| Agenda calendario | ✔ | Citas CRUD/transiciones |
| Disponibilidad / Rules / Slots | ✔ F1–F3 | SSOT BE |
| Blocks / Waitlist / Reminders | ✔ F4–F6 | Reminders sin canal real de envío |
| Timezone | ✔ F7 | Clínica + override doctor |
| Dashboard Agenda | ✔ F9 | READ ONLY |
| Persistencia EMR vs efímero Copilot | ✔ frontera clara | No mezclar recovery |

---

## 3. Seguridad

| Control | Estado |
|---------|--------|
| JWT global (`JwtAuthGuard`) | ✔ |
| RBAC (`RolesGuard` DOCTOR/ADMIN) | ✔ en superficies producto |
| Clinic scope (`ClinicGuard` + `AuthorizationService`) | ✔ |
| Doctor scope Agenda | ✔ `resolveDoctorId` |
| CSRF mutaciones | ✔ cookie + header |
| Ownership Copilot (sessionStorage) | ✔ RC2 |
| FeatureGuard / plan (Copilot facade) | ✔ |
| Kill switch Copilot FE | ✔ |
| Feature flag Agenda dedicado | ✖ no existe (superficie siempre on) |
| Audit logs plataforma | ✔ parcial (retención a largo plazo: gap histórico) |

---

## 4. Performance

| Área | Hallazgo |
|------|----------|
| Agenda page fan-out | Múltiples queries React Query en mount (citas, availability, blocks, waitlist, reminders, timezone) |
| React Query | `staleTime` ~60s en listados panel |
| Copilot | Sin React Query; bootstrap bundle session+workspace+memory+timeline |
| Copilot multi-réplica | Sesiones in-memory → sticky/Redis requeridos a escala |
| Bundle FE | Rutas dinámicas panel; Copilot y Agenda en code paths separados |
| Reminders BE | Poll periódico `processDueReminders` |

---

## 5. Production (Railway / Vercel)

| Capa | Target | Notas |
|------|--------|-------|
| Backend | Railway | API SSOT |
| Frontend | Vercel | Preview vs Production separados (runbook enterprise) |
| Variables FE | `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_MEDICAL_COPILOT` | Agenda sin flags |
| Monitoring live (esta auditoría) | Railway MCP no autenticado | No se consultó flota en vivo |
| Runbooks | `ENTERPRISE_OPERATIONAL_RELEASE_RUNBOOK.md`, Agenda F10 guides, Copilot RC docs | Separados por producto |

---

## 6. Gates locales (esta auditoría)

### Backend (`feature/agenda-enterprise`)

| Gate | Resultado |
|------|-----------|
| `format:check` | ✔ |
| `lint:ci` | ✔ 0 errors (47 warnings preexistentes) |
| `build` | ✔ |
| `test` | ✔ 401 (tras fix mínimo constructor spec) |

### Frontend (`feature/agenda-enterprise`)

| Gate | Resultado |
|------|-----------|
| `lint` / tsc | ✔ |
| `test` | ✔ 460 |
| `build` | ✔ |
| Playwright RC2 crítico | **NO GO runtime** — sin `.env.e2e`; fallos por shell no visible (entorno, no regresión de código demostrada) |

---

## 7. Fix mínimo aplicado

| Repo | Cambio | Motivo |
|------|--------|--------|
| Backend | `appointments.service.spec.ts` — args constructor (+ `dataSource`, + `clinicService`) | Bloqueaba `npm test` |

Sin otros cambios de comportamiento.

---

## 8. Fuera de alcance (no iniciado)

v2 · IA nueva · Agenda v2 · Marketplace · Analytics · nuevos motores · nuevas integraciones · merge · deploy · promotion
