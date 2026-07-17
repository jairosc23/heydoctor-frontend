# Agenda Enterprise — Production Readiness (Fase 10)

> Branch: `feature/agenda-enterprise`  
> Backend SSOT HEAD: `82841419d6f25050808ea2aa93891180e843a56e`  
> Frontend feature HEAD (F9): `99f694f8e57d9b2a31fa3a46b80e58c161f5c780`  
> Medical Copilot / AI / RC3–RC6: **fuera de alcance y congelados**

---

## Pregunta

¿Está Agenda Enterprise (Fases 1–9) lista para producción?

### Veredicto de preparación

| Dimensión | Estado |
|-----------|--------|
| Completitud funcional F1–9 en rama | **GO** |
| SSOT Backend como única fuente | **GO** |
| Gates FE locales (tsc / test / build) | **GO** (ejecutar en F10) |
| Documentación operacional F10 | **GO** (este paquete) |
| Merge a main | **PENDING** (decisión humana) |
| Deploy producción | **NO GO** hasta checklist release + aprobación |

**Resumen:** listo para **promoción controlada** (merge + deploy) solo tras checklist GO; esta fase **no ejecuta** merge ni deploy.

---

## Principios de readiness

1. Backend es SSOT — FE es consumidor + presentación.
2. Sin motores clínicos / IA / analytics en Agenda.
3. Mutaciones solo vía endpoints ya certificados.
4. Dashboard y UX no inventan reglas de negocio.
5. Timezone IANA clínica con override doctor opcional.
6. Roles: DOCTOR / ADMIN; tenant por clínica.

---

## Dependencias de runtime

| Componente | Requisito |
|------------|-----------|
| API Nest | Prefijo `/api`; JWT + RolesGuard |
| DB | Migraciones appointments enterprise + timezone aplicadas |
| FE | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` |
| Auth | Sesión panel con clinicId resuelto |
| Roles | Doctor o Admin del tenant |

Migraciones clave (Backend):

- `1749500000000-AppointmentsEnterpriseScheduling` — rules / blocks  
- `1752600000000-ScheduleBlocksIsActive`  
- `1752700000000-WaitlistPriorityReason`  
- `1752800000000-ReminderPoliciesAndOffset`  
- `1752900000000-ClinicAndDoctorTimezone`

---

## Superficie de producción (no ampliar)

**Incluido:** Availability, Rules, Slots, Blocks, Waitlist, Reminders (admin), Timezone, Workspace UX, Dashboard READ ONLY, calendario citas existente.

**Excluido explícitamente (NO GO product backlog):**

- Google Calendar / Outlook / ICS  
- Analytics / reportes / export PDF-Excel  
- IA Agenda / predicciones  
- Marketplace Agenda  
- Agenda Enterprise v2  
- Envío real de reminders a SMS/email providers (si no está cableado)

---

## Riesgos residuales

| Riesgo | Mitigación |
|--------|------------|
| Desfase temporal slots FE vs motor BE | Refetch post-mutación; rangos de query alineados |
| Admin sin doctor | UI exige doctor para availability |
| Timezone mal configurada | Panel settings + fallback documentado |
| Reminders sin canal | Operar como admin SSOT hasta integración de canal |
| Contaminación Medical Copilot | Freeze estricto; F10 no toca AI |

---

## GO / NO GO (producción)

| Criterio | GO si… |
|----------|--------|
| Migraciones aplicadas en target | ✔ |
| Feature mergeada a rama de release | ✔ |
| Smoke staging F1–9 | ✔ |
| Rollback plan revisado | ✔ |
| Aprobación producto/ops | ✔ |

Sin todos los criterios → **NO GO deploy**.
