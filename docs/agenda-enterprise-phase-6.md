# Agenda Enterprise — Fase 6 certificada (Reminders)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado**

## Auditoría de reutilización

| Capacidad | SSOT | Fase 6 |
|-----------|------|--------|
| Entity `appointment_reminders` | Sí | Reutilizada + `offsetMinutes` |
| Poll `@Interval` + outbox | Sí | Sin duplicar; sin envío real |
| `scheduleDefaultReminders` | Hardcode | Lee políticas activas |
| Políticas | — | Tabla aditiva `appointment_reminder_policies` |
| REST instancias | — | GET/POST/PATCH/DELETE `/appointments/reminders` |
| REST políticas | — | GET/POST/PATCH/DELETE `/appointments/reminders/policies` |

## Superficie FE

- Cliente reminders en `appointments.ts`
- Panel: configuración (offsets 24h/2h/30min + canales) + lista programados
- Invalidación React Query cruzada con appointments / availability / waitlist

## Fuera de alcance

Timezone profile · calendarios externos · Dashboard · Analytics · envío real a proveedores
